import logging

from ...ai_entities.json_types import JsonObject, JsonValue
from ...ai_entities.parsing import as_int, as_list, as_object
from ...exceptions import AIResponseError
from ...schemas.change_set_schema import MAX_OPS_PER_CHANGE_SET
from ..change_set_service import clean_reason
from ..change_set_types import ChangeOp
from .registry import EditableEntity

logger = logging.getLogger(__name__)


def parse_edit_ops(
    raw_ops: JsonValue, entities: dict[str, EditableEntity]
) -> list[ChangeOp]:
    """Keep only the ops that edit this trip's own entities in ways they allow.

    Anything else the model proposed is dropped, and only the first op on any one
    entity is kept so the set can be applied in one go.
    """
    listed = as_list(raw_ops)
    if listed is None:
        raise AIResponseError("AI response must contain a list of ops.")

    ops: list[ChangeOp] = []
    edited: set[tuple[str, int]] = set()
    for raw in listed:
        op = _parse_op(raw, entities)
        if op is None:
            logger.warning("Dropped an AI edit: %r", raw)
        elif _is_repeat(op, edited):
            logger.warning("Dropped a second AI edit of one entity: %r", raw)
        else:
            ops.append(op)
        if len(ops) == MAX_OPS_PER_CHANGE_SET:
            break
    return ops


def _is_repeat(op: ChangeOp, edited: set[tuple[str, int]]) -> bool:
    if "id" not in op:
        return False
    target = (op["entity"], op["id"])
    if target in edited:
        return True
    edited.add(target)
    return False


def _parse_op(raw: JsonValue, entities: dict[str, EditableEntity]) -> ChangeOp | None:
    fields = as_object(raw)
    entity = fields.get("entity") if fields else None
    if fields is None or not isinstance(entity, str) or entity not in entities:
        return None
    editable = entities[entity]
    kind = fields.get("op")
    if kind not in editable.validator.kinds:
        return None
    reason = clean_reason(fields.get("reason"))
    if kind == "create":
        return _create_op(editable, entity, fields, reason)
    entity_id = as_int(fields.get("id"))
    if entity_id is None or entity_id not in editable.descriptions:
        return None
    if kind == "update":
        return _update_op(editable, entity, entity_id, fields, reason)
    return _delete_op(editable, entity, entity_id, reason)


def _create_op(
    editable: EditableEntity, entity: str, fields: JsonObject, reason: str | None
) -> ChangeOp | None:
    data = editable.validator.validate_create(fields.get("data"))
    if data is None:
        return None
    return {"op": "create", "entity": entity, "data": data, "reason": reason}


def _update_op(
    editable: EditableEntity,
    entity: str,
    entity_id: int,
    fields: JsonObject,
    reason: str | None,
) -> ChangeOp | None:
    data = editable.validator.validate_edit(entity_id, fields.get("data"))
    if data is None:
        return None
    return {
        "op": "update",
        "entity": entity,
        "id": entity_id,
        "label": editable.descriptions[entity_id].label,
        "data": data,
        "reason": reason,
    }


def _delete_op(
    editable: EditableEntity, entity: str, entity_id: int, reason: str | None
) -> ChangeOp:
    return {
        "op": "delete",
        "entity": entity,
        "id": entity_id,
        "label": editable.descriptions[entity_id].label,
        "data": {},
        "reason": reason,
    }

import logging
from typing import Any

from ...exceptions import AIResponseError
from ...schemas.change_set_schema import MAX_OPS_PER_CHANGE_SET
from ..change_set_service import clean_reason
from .editor_base import EntityEditor

logger = logging.getLogger(__name__)

OP_KINDS = ("create", "update", "delete")


def _dropped(reason: str, raw: Any) -> None:
    logger.warning("Dropped an AI edit (%s): %r", reason, raw)


def _own_item_id(raw: dict[str, Any], editor: EntityEditor) -> int | None:
    """The id of an item of this trip, or None when it is missing or foreign."""
    item_id = raw.get("id")
    if type(item_id) is int and item_id in editor.ids():
        return item_id
    return None


def _allowed_data(raw: dict[str, Any], editor: EntityEditor, kind: str) -> dict:
    data = raw.get("data")
    if not isinstance(data, dict):
        return {}
    allowed = {}
    for field in editor.allowed_fields(kind):
        if field in data:
            allowed[field] = data[field]
    return allowed


def _has_required(data: dict[str, Any], editor: EntityEditor) -> bool:
    return set(editor.create_required) <= data.keys()


def _clean_op(raw: Any, editors: dict[str, EntityEditor]) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return _dropped("not an object", raw)
    kind, entity = raw.get("op"), raw.get("entity")
    if kind not in OP_KINDS or not isinstance(entity, str) or entity not in editors:
        return _dropped("unknown op or entity", raw)
    editor = editors[entity]
    if kind not in editor.kinds:
        return _dropped("not allowed for this entity", raw)

    op: dict[str, Any] = {"op": kind, "entity": entity, "data": {}}
    if kind != "create":
        op["id"] = _own_item_id(raw, editor)
        if op["id"] is None:
            return _dropped("not an item of this trip", raw)
    if kind != "delete":
        data = _allowed_data(raw, editor, kind)
        if not data or (kind == "create" and not _has_required(data, editor)):
            return _dropped("no usable data", raw)
        op["data"] = editor.normalise(kind, op.get("id"), data)
        if op["data"] is None:
            return _dropped("unusable values", raw)
    op["reason"] = clean_reason(raw.get("reason"))
    return op


def sanitise_edit_ops(
    raw_ops: Any, editors: dict[str, EntityEditor]
) -> list[dict[str, Any]]:
    """Keep only the ops that edit this trip's own items in ways the editors allow.

    Anything else the model proposed is dropped, and only the first op on any one
    item is kept so the set can be applied in one go.
    """
    if not isinstance(raw_ops, list):
        raise AIResponseError("AI response must contain a list of ops.")

    ops: list[dict[str, Any]] = []
    edited: set[tuple[str, int]] = set()
    for raw in raw_ops:
        op = _clean_op(raw, editors)
        if op is None:
            continue
        if "id" in op:
            target = (op["entity"], op["id"])
            if target in edited:
                _dropped("second op on one item", raw)
                continue
            edited.add(target)
        ops.append(op)
        if len(ops) == MAX_OPS_PER_CHANGE_SET:
            break
    return ops

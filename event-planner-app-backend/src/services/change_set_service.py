import logging
from typing import Any

from marshmallow import ValidationError

from ..ai_entities.json_types import JsonObject, JsonValue
from ..extensions import db
from ..schemas.event_schema import EventSchema
from .change_set_appliers import (
    ChangeSetApplier,
    ChangeSetApplierFactory,
    PreparedOp,
)
from .change_set_types import ChangeOp

logger = logging.getLogger(__name__)

EVENT_FIELDS = (
    "name",
    "description",
    "address",
    "latitude",
    "longitude",
    "start_at",
    "end_at",
    "category",
)

_COUNT_KEYS = {"create": "created", "update": "updated", "delete": "deleted"}


def validate_ops(
    itinerary_id: int, ops: list[dict], user_id: int | None, role: str | None = None
) -> list[tuple[ChangeSetApplier, PreparedOp]]:
    """Validate every op up front, collecting all errors by op index."""
    prepared, errors = [], {}
    for index, op in enumerate(ops):
        applier = ChangeSetApplierFactory.create(
            op["entity"], itinerary_id, user_id, role
        )
        try:
            prepared.append((applier, applier.prepare(op)))
        except ValidationError as err:
            errors[str(index)] = err.messages
    if errors:
        raise ValidationError({"ops": errors})
    return prepared


def apply_change_set(
    itinerary_id: int,
    ops: list[dict],
    user_id: int | None,
    role: str | None = None,
    *,
    commit: bool = True,
) -> dict[str, int]:
    """Validate every op, then apply them all in one transaction (all or nothing).

    With ``commit=False`` the ops are only staged, so the caller can add more work
    to the same transaction and commit once.
    """
    prepared = validate_ops(itinerary_id, ops, user_id, role)
    counts = {key: 0 for key in _COUNT_KEYS.values()}

    try:
        for applier, op in prepared:
            applier.apply(op)
            counts[_COUNT_KEYS[op.kind]] += 1
        if commit:
            db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return counts


def clean_reason(reason: Any) -> str | None:
    if isinstance(reason, str) and reason.strip():
        return reason.strip()[:200]
    return None


def build_event_create_ops(suggestions: list[dict]) -> list[dict]:
    """Turn AI event suggestions into preview-only create ops (nothing is saved)."""
    schema = EventSchema()
    ops = []
    for suggestion in suggestions:
        fields = {k: v for k, v in suggestion.items() if k in EVENT_FIELDS}
        ops.append(
            {
                "op": "create",
                "entity": "event",
                "data": schema.dump(schema.load(fields)),
                "reason": clean_reason(suggestion.get("reason")),
            }
        )
    return ops


def build_event_update_ops(updates: list[dict]) -> list[dict]:
    """Turn AI-optimised event times into preview-only update ops."""
    schema = EventSchema(only=("start_at", "end_at"))
    ops = []
    for update in updates:
        times = {"start_at": update["start_at"], "end_at": update["end_at"]}
        ops.append(
            {
                "op": "update",
                "entity": "event",
                "id": update["id"],
                "data": schema.dump(schema.load(times)),
                "reason": clean_reason(update.get("reason")),
            }
        )
    return ops


def build_event_delete_ops(removals: list[dict]) -> list[dict]:
    ops = []
    for removal in removals:
        ops.append(
            {
                "op": "delete",
                "entity": "event",
                "id": removal["id"],
                "data": {},
                "reason": clean_reason(removal.get("reason")),
            }
        )
    return ops


def build_create_op(
    entity: str, data: JsonObject, reason: JsonValue = None
) -> ChangeOp:
    return {
        "op": "create",
        "entity": entity,
        "data": data,
        "reason": clean_reason(reason),
    }


def build_edit_ops(
    itinerary_id: int,
    user_id: int | None,
    proposed: list[ChangeOp],
    role: str | None = None,
) -> list[ChangeOp]:
    """Ops that fail their entity schema are dropped. Nothing is saved."""
    ops = []
    for op in proposed:
        applier = ChangeSetApplierFactory.create(
            op["entity"], itinerary_id, user_id, role
        )
        try:
            prepared = applier.prepare(op)
        except ValidationError as err:
            logger.warning("Dropped an invalid %s edit: %s", op["entity"], err.messages)
            continue
        ops.append({**op, "data": applier.preview(prepared)})
    return ops

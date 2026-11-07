from typing import Any

from marshmallow import ValidationError

from ..extensions import db
from ..schemas.accommodation_schema import AccommodationSchema
from ..schemas.event_schema import EventSchema
from ..schemas.wishlist_schema import WishlistItemSchema
from .change_set_appliers import (
    ChangeSetApplier,
    ChangeSetApplierFactory,
    PreparedOp,
)

EVENT_FIELDS = (
    "name",
    "description",
    "address",
    "latitude",
    "longitude",
    "start_at",
    "end_at",
    "category",
    "estimated_cost_gbp",
    "price_tier",
)

_ESTIMATE_FIELDS = ("estimated_cost_gbp", "price_tier")
_ESTIMATE_SCHEMAS = {
    "event": EventSchema,
    "accommodation": AccommodationSchema,
    "wishlist_item": WishlistItemSchema,
}

_COUNT_KEYS = {"create": "created", "update": "updated", "delete": "deleted"}


def validate_ops(
    itinerary_id: int, ops: list[dict], user_id: int | None
) -> list[tuple[ChangeSetApplier, PreparedOp]]:
    """Validate every op up front, collecting all errors by op index."""
    prepared, errors = [], {}
    for index, op in enumerate(ops):
        applier = ChangeSetApplierFactory.create(op["entity"], itinerary_id, user_id)
        try:
            prepared.append((applier, applier.prepare(op)))
        except ValidationError as err:
            errors[str(index)] = err.messages
    if errors:
        raise ValidationError({"ops": errors})
    return prepared


def apply_change_set(
    itinerary_id: int, ops: list[dict], user_id: int | None, commit: bool = True
) -> dict[str, int]:
    """Validate every op, then apply them all in one transaction (all or nothing).

    Pass ``commit=False`` to flush only, so the caller can join the ops to a larger
    transaction (the caller then owns the commit and rollback).
    """
    prepared = validate_ops(itinerary_id, ops, user_id)
    counts = {key: 0 for key in _COUNT_KEYS.values()}

    try:
        for applier, op in prepared:
            applier.apply(op)
            counts[_COUNT_KEYS[op.kind]] += 1
        if commit:
            db.session.commit()
    except Exception:
        if commit:
            db.session.rollback()
        raise

    return counts


def _clean_reason(reason: Any) -> str | None:
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
                "reason": _clean_reason(suggestion.get("reason")),
            }
        )
    return ops


def build_event_update_ops(updates: list[dict]) -> list[dict]:
    """Turn AI-optimised event times into preview-only update ops."""
    schema = EventSchema(only=("start_at", "end_at"))
    return [
        {
            "op": "update",
            "entity": "event",
            "id": update["id"],
            "data": schema.dump(update),
            "reason": _clean_reason(update.get("reason")),
        }
        for update in updates
    ]


def build_cost_estimate_ops(estimates: list[dict]) -> list[dict]:
    """Turn AI cost estimates for existing items into preview-only update ops."""
    ops = []
    for estimate in estimates:
        schema = _ESTIMATE_SCHEMAS[estimate["entity"]](only=_ESTIMATE_FIELDS)
        fields = {k: estimate[k] for k in _ESTIMATE_FIELDS if k in estimate}
        ops.append(
            {
                "op": "update",
                "entity": estimate["entity"],
                "id": estimate["id"],
                "data": schema.dump(schema.load(fields)),
                "reason": _clean_reason(estimate.get("reason")),
            }
        )
    return ops


def build_edit_ops(proposed: list[dict]) -> list[dict]:
    """Turn sanitised AI edit ops into preview-only ops with API-shaped data.

    Ops whose data fails the entity's schema are dropped rather than failing the preview.
    """
    ops = []
    for op in proposed:
        applier = ChangeSetApplierFactory.create(op["entity"], 0, None)
        try:
            prepared = applier.prepare(op)
        except ValidationError:
            continue
        ops.append({**op, "data": applier.preview(prepared)})
    return ops

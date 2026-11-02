from typing import Any

from marshmallow import ValidationError

from ..extensions import db
from ..schemas.accommodation_schema import AccommodationSchema
from ..schemas.event_schema import EventSchema
from ..schemas.packing_item_schema import PackingItemSchema
from ..schemas.wishlist_schema import WishlistItemSchema
from . import (
    accommodation_service,
    events_service,
    packing_item_service,
    wishlist_service,
)

DEFAULT_WISHLIST_NAME = "AI ideas"

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

_CREATE_DEFAULTS: dict[str, dict[str, Any]] = {
    "packing_item": {"is_shared": True, "category": "General"},
}

_SCHEMAS = {
    "event": EventSchema,
    "accommodation": AccommodationSchema,
    "packing_item": PackingItemSchema,
    "wishlist_item": WishlistItemSchema,
}


def _pop_wishlist_name(data: dict) -> tuple[dict, str]:
    remaining = dict(data)
    name = remaining.pop("wishlist_name", None) or remaining.pop("wishlistName", None)
    return remaining, (name or DEFAULT_WISHLIST_NAME)


def _prepare_op(op: dict) -> dict:
    """Validate an op's data with the entity's existing schema."""
    entity, kind = op["entity"], op["op"]
    prepared = {**op, "validated": {}, "wishlist_name": DEFAULT_WISHLIST_NAME}

    if kind == "delete":
        return prepared

    data = dict(op["data"])
    if entity == "wishlist_item":
        data, prepared["wishlist_name"] = _pop_wishlist_name(data)
    if kind == "create":
        data = {**_CREATE_DEFAULTS.get(entity, {}), **data}

    schema = _SCHEMAS[entity](partial=(kind == "update"))
    prepared["validated"] = schema.load(data)
    return prepared


def validate_ops(ops: list[dict]) -> list[dict]:
    prepared, errors = [], {}
    for index, op in enumerate(ops):
        try:
            prepared.append(_prepare_op(op))
        except ValidationError as err:
            errors[str(index)] = err.messages
    if errors:
        raise ValidationError({"ops": errors})
    return prepared


def _apply_event(itinerary_id: int, op: dict, user_id: int | None):
    data = op["validated"]
    if op["op"] == "create":
        events_service.stage_create_event(
            itinerary_id,
            {**data, "created_by_id": user_id, "updated_by_id": user_id},
        )
    elif op["op"] == "update":
        events_service.stage_update_event(itinerary_id, op["id"], data, user_id)
    else:
        events_service.stage_delete_event(itinerary_id, op["id"])


def _apply_accommodation(itinerary_id: int, op: dict, user_id: int | None):
    data = op["validated"]
    if op["op"] == "create":
        accommodation_service.stage_create_accommodation(user_id, itinerary_id, data)
    elif op["op"] == "update":
        accommodation_service.stage_update_accommodation(
            itinerary_id, op["id"], user_id, data
        )
    else:
        accommodation_service.stage_delete_accommodation(itinerary_id, op["id"])


def _apply_packing_item(itinerary_id: int, op: dict, user_id: int | None):
    data = op["validated"]
    if op["op"] == "create":
        packing_item_service.stage_create_packing_item(user_id, itinerary_id, data)
    elif op["op"] == "update":
        packing_item_service.stage_update_packing_item(
            user_id, itinerary_id, op["id"], data
        )
    else:
        packing_item_service.stage_delete_packing_item(
            user_id, itinerary_id, op["id"]
        )


def _apply_wishlist_item(itinerary_id: int, op: dict, user_id: int | None):
    data = op["validated"]
    if op["op"] == "create":
        wishlist = wishlist_service.get_wishlist_by_name(
            itinerary_id, op["wishlist_name"]
        ) or wishlist_service.stage_create_wishlist(
            user_id, itinerary_id, op["wishlist_name"]
        )
        wishlist_service.stage_create_wishlist_item(
            itinerary_id, wishlist.id, data, user_id
        )
    elif op["op"] == "update":
        wishlist_service.stage_update_wishlist_item(
            itinerary_id, op["id"], data, user_id
        )
    else:
        wishlist_service.stage_delete_wishlist_item(itinerary_id, op["id"])


_APPLIERS = {
    "event": _apply_event,
    "accommodation": _apply_accommodation,
    "packing_item": _apply_packing_item,
    "wishlist_item": _apply_wishlist_item,
}


def apply_change_set(
    itinerary_id: int, ops: list[dict], user_id: int | None
) -> dict[str, int]:
    """Validate every op, then apply them all in one transaction (all or nothing)."""
    prepared = validate_ops(ops)
    counts = {"created": 0, "updated": 0, "deleted": 0}

    try:
        for op in prepared:
            _APPLIERS[op["entity"]](itinerary_id, op, user_id)
            counts[{"create": "created", "update": "updated", "delete": "deleted"}[op["op"]]] += 1
        db.session.commit()
    except Exception:
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

"""Whole-trip AI generation: turns saved preferences into preview-only change-set ops."""

import logging
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any, Protocol

from marshmallow import ValidationError

from ..schemas.change_set_schema import MAX_OPS_PER_CHANGE_SET
from ..models.trip_preferences_model import EDITABLE_FIELDS
from ..utils import ai_output_validators
from ..utils.location_utils import get_place_details
from . import ai_services
from .change_set_appliers import DEFAULT_WISHLIST_NAME
from .change_set_service import build_event_create_ops
from .itineraries_service import get_itinerary
from .trip_preferences_service import get_preferences

logger = logging.getLogger(__name__)

PLAN_SECTIONS = ("accommodations", "events", "packing_items", "wishlist_items")


class PlannableTrip(Protocol):
    """What the planner reads from a trip, so it works before the trip is saved."""

    id: int | None
    destination: str
    start_date: date
    end_date: date
    timezone: str | None
    budget_amount_gbp: float | None


@dataclass(frozen=True)
class TripBrief:
    """A trip that has not been saved yet."""

    destination: str
    start_date: date
    end_date: date
    timezone: str | None
    budget_amount_gbp: float | None = None
    id: int | None = None


def _text(value: Any, limit: int) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()[:limit]
    return None


def _trip_days(itinerary) -> list[str]:
    day_count = (itinerary.end_date - itinerary.start_date).days + 1
    return [
        (itinerary.start_date + timedelta(days=offset)).isoformat()
        for offset in range(day_count)
    ]


def _geocode(itinerary_id: int, name: str, address: str | None) -> dict | None:
    """Look up a place; returns None (and logs) when it cannot be found."""
    try:
        details = get_place_details(name=name, address=address)
    except Exception:
        logger.exception(
            "Trip %s: could not geocode %r (address %r).", itinerary_id, name, address
        )
        return None
    return {
        "latitude": details["latitude"],
        "longitude": details["longitude"],
        "address": details.get("formatted_address") or address,
    }


def _build_prompt(itinerary, preferences: dict, days: list[str]) -> str:
    def pref(attribute: str, fallback: str) -> str:
        value = preferences.get(attribute)
        if isinstance(value, list):
            value = ", ".join(value)
        return str(value) if value else fallback

    return f"""
You are an expert travel planner API.

Plan a whole trip to {itinerary.destination} from {itinerary.start_date} to
{itinerary.end_date}. Local timezone: {itinerary.timezone or "UTC"}.

TRAVELLER PREFERENCES:
- Trip type: {pref("trip_type", "not specified")}
- Group size: {pref("group_size", "not specified")}
- Vibe: {pref("vibes", "not specified")}
- Budget tier: {pref("budget_tier", "not specified")}
- Total budget (GBP): {itinerary.budget_amount_gbp or "not specified"}
- Pace: {pref("pace", "balanced")}
- Interests: {pref("interests", "general sightseeing and food")}
- Transport: {pref("transport", "public_transport")}

REQUIREMENTS:
1. Real-world venues only, with exact names and full street addresses.
2. Plan events on every one of these days: {", ".join(days)}. Respect the pace.
3. Events on a day must be chronological and must not overlap.
4. start_at and end_at are local wall-clock times formatted YYYY-MM-DDTHH:MM:SS
   with no offset or "Z", and both on the event's day.
5. Suggest 1-2 accommodations. start_date and end_date are YYYY-MM-DD within the trip.
6. Suggest 8-20 packing items and 3-8 wishlist ideas (places to consider).
7. Every item has a "reason": one short sentence, max 120 characters.
8. Return ONLY a JSON object, with no markdown code blocks.

JSON FORMAT:

{{
  "events": [
    {{"name": "", "description": "Max 100 characters", "address": "", "start_at": "", "end_at": "", "category": "Max 10 characters", "reason": ""}}
  ],
  "accommodations": [
    {{"name": "", "address": "", "description": "", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "reason": ""}}
  ],
  "packing_items": [
    {{"name": "", "category": "Clothing", "is_shared": false, "reason": ""}}
  ],
  "wishlist_items": [
    {{"name": "", "description": "", "address": "", "reason": ""}}
  ]
}}
"""


def _event_to_op(itinerary, event: Any, days: list[str]) -> dict | None:
    if not isinstance(event, dict):
        return None
    day = str(event.get("start_at", ""))[:10]
    if day not in days or not ai_output_validators.validate_event_suggestion(
        event, day
    ):
        logger.warning("Trip %s: dropped invalid event %r.", itinerary.id, event)
        return None
    place = _geocode(itinerary.id, event["name"], event.get("address"))
    if place is None:
        return None

    suggestion = {
        "name": event["name"][:100],
        "description": _text(event.get("description"), 100),
        "category": event["category"][:10],
        "start_at": ai_services.trip_local_to_utc(
            event["start_at"], itinerary.timezone
        ).isoformat(),
        "end_at": ai_services.trip_local_to_utc(
            event["end_at"], itinerary.timezone
        ).isoformat(),
        "reason": event.get("reason"),
        **place,
    }
    try:
        return build_event_create_ops([suggestion])[0]
    except ValidationError as err:
        logger.warning(
            "Trip %s: event %r failed validation: %s",
            itinerary.id,
            event["name"],
            err.messages,
        )
        return None


def _accommodation_to_op(itinerary, item: Any) -> dict | None:
    if not isinstance(item, dict) or not _text(item.get("name"), 255):
        logger.warning("Trip %s: dropped invalid accommodation %r.", itinerary.id, item)
        return None
    try:
        start = date.fromisoformat(str(item.get("start_date")))
        end = date.fromisoformat(str(item.get("end_date")))
    except ValueError:
        logger.warning("Trip %s: bad accommodation dates in %r.", itinerary.id, item)
        return None
    if end < start:
        return None

    place = _geocode(itinerary.id, item["name"], item.get("address"))
    if place is None:
        return None
    return {
        "op": "create",
        "entity": "accommodation",
        "data": {
            "name": item["name"].strip()[:255],
            "description": _text(item.get("description"), 255),
            "start_date": max(start, itinerary.start_date).isoformat(),
            "end_date": min(end, itinerary.end_date).isoformat(),
            **place,
        },
        "reason": _text(item.get("reason"), 200),
    }


def _packing_item_to_op(item: Any) -> dict | None:
    valid = ai_output_validators.validate_packing_items([item])
    if not valid:
        return None
    return {
        "op": "create",
        "entity": "packing_item",
        "data": {
            "name": valid[0]["name"][:100],
            "category": valid[0]["category"][:50],
            "is_shared": valid[0]["is_shared"],
        },
        "reason": _text(item.get("reason"), 200),
    }


def _wishlist_item_to_op(itinerary_id: int, item: Any) -> dict | None:
    if not isinstance(item, dict) or not _text(item.get("name"), 255):
        return None
    place = _geocode(itinerary_id, item["name"], item.get("address")) or {}
    return {
        "op": "create",
        "entity": "wishlist_item",
        "data": {
            "name": item["name"].strip()[:255],
            "description": _text(item.get("description"), 255),
            "wishlist_name": DEFAULT_WISHLIST_NAME,
            **place,
        },
        "reason": _text(item.get("reason"), 200),
    }


def _section(plan: dict, name: str, itinerary_id: int) -> list:
    items = plan.get(name)
    if not isinstance(items, list):
        logger.warning("Trip %s: AI plan has no usable %r list.", itinerary_id, name)
        return []
    return items


def _convert_plan(itinerary, plan: dict, days: list[str]) -> list[dict]:
    converters = {
        "accommodations": lambda item: _accommodation_to_op(itinerary, item),
        "events": lambda item: _event_to_op(itinerary, item, days),
        "packing_items": _packing_item_to_op,
        "wishlist_items": lambda item: _wishlist_item_to_op(itinerary.id, item),
    }
    sections = {name: _section(plan, name, itinerary.id) for name in PLAN_SECTIONS}
    sections["accommodations"] = sections["accommodations"][:2]

    ops = []
    for name in PLAN_SECTIONS:
        converted = (converters[name](item) for item in sections[name])
        ops.extend(op for op in converted if op is not None)
    return ops


def _request_plan(itinerary_id: int, prompt: str) -> dict | None:
    try:
        plan = ai_services.format_json(ai_services.get_ai_response(prompt))
    except (ValueError, RuntimeError):
        logger.exception("Trip %s: AI plan request or parsing failed.", itinerary_id)
        return None
    if not isinstance(plan, dict):
        logger.error(
            "Trip %s: AI plan was %s, expected an object.",
            itinerary_id,
            type(plan).__name__,
        )
        return None
    return plan


def preferences_to_dict(preferences) -> dict:
    """The editable preference fields of a saved row, or {} when there is none."""
    if preferences is None:
        return {}
    return {field: getattr(preferences, field) for field in EDITABLE_FIELDS}


def generate_plan_ops(trip: PlannableTrip, preferences: dict) -> list[dict]:
    """Propose a whole-trip plan as preview-only change-set ops. Saves nothing."""
    days = _trip_days(trip)
    plan = _request_plan(trip.id, _build_prompt(trip, preferences, days))
    if plan is None:
        return []

    ops = _convert_plan(trip, plan, days)
    if len(ops) > MAX_OPS_PER_CHANGE_SET:
        logger.warning(
            "Trip %s: truncating %s generated ops to %s.",
            trip.id,
            len(ops),
            MAX_OPS_PER_CHANGE_SET,
        )
    return ops[:MAX_OPS_PER_CHANGE_SET]


def generate_trip_plan(itinerary_id: int) -> list[dict]:
    """Plan a saved trip from its stored preferences."""
    return generate_plan_ops(
        get_itinerary(itinerary_id),
        preferences_to_dict(get_preferences(itinerary_id)),
    )

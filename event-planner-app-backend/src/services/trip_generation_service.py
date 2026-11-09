"""Whole-trip AI generation: turns saved preferences into preview-only change-set ops."""

import logging
from datetime import date, timedelta
from typing import Any

from marshmallow import ValidationError

from ..exceptions import AIResponseError
from ..schemas.change_set_schema import MAX_OPS_PER_CHANGE_SET
from ..utils import ai_output_validators
from ..utils.db_utils import release_connection
from ..utils.location_utils import get_place_details
from ..utils.progress import ProgressCallback, no_progress
from . import ai_services
from .change_set_appliers import DEFAULT_WISHLIST_NAME
from .change_set_service import build_event_create_ops, build_packing_create_op
from .itineraries_service import get_itinerary
from .trip_preferences_service import get_preferences

logger = logging.getLogger(__name__)

PLAN_SECTIONS = ("accommodations", "events", "packing_items", "wishlist_items")
PLACE_SECTIONS = ("accommodations", "events", "wishlist_items")


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


def _build_prompt(itinerary, preferences, days: list[str]) -> str:
    def pref(attribute: str, fallback: str) -> str:
        value = getattr(preferences, attribute, None)
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
    return build_packing_create_op(
        valid[0]["name"],
        valid[0]["category"],
        valid[0]["is_shared"],
        item.get("reason"),
    )


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


def _convert_plan(
    itinerary, plan: dict, days: list[str], progress: ProgressCallback
) -> list[dict]:
    converters = {
        "accommodations": lambda item: _accommodation_to_op(itinerary, item),
        "events": lambda item: _event_to_op(itinerary, item, days),
        "packing_items": _packing_item_to_op,
        "wishlist_items": lambda item: _wishlist_item_to_op(itinerary.id, item),
    }
    sections = {name: _section(plan, name, itinerary.id) for name in PLAN_SECTIONS}
    sections["accommodations"] = sections["accommodations"][:2]
    places_total = sum(len(sections[name]) for name in PLACE_SECTIONS)

    ops = []
    looked_up = 0
    for name in PLAN_SECTIONS:
        for item in sections[name]:
            if name in PLACE_SECTIONS:
                looked_up += 1
                progress("Looking up places", looked_up, places_total)
            op = converters[name](item)
            if op is not None:
                ops.append(op)
    return ops


def _request_plan(prompt: str) -> dict:
    plan = ai_services.format_json(ai_services.get_ai_response(prompt))
    if not isinstance(plan, dict):
        raise AIResponseError(f"AI plan was {type(plan).__name__}, expected an object.")
    return plan


def generate_trip_plan(
    itinerary_id: int, progress: ProgressCallback = no_progress
) -> list[dict]:
    """Propose a whole-trip plan as preview-only change-set ops. Saves nothing."""
    itinerary = get_itinerary(itinerary_id)
    days = _trip_days(itinerary)
    prompt = _build_prompt(itinerary, get_preferences(itinerary_id), days)

    release_connection()
    progress("Asking the AI to plan your trip", None, None)
    plan = _request_plan(prompt)

    ops = _convert_plan(itinerary, plan, days, progress)
    if len(ops) > MAX_OPS_PER_CHANGE_SET:
        logger.warning(
            "Trip %s: truncating %s generated ops to %s.",
            itinerary_id,
            len(ops),
            MAX_OPS_PER_CHANGE_SET,
        )
    return ops[:MAX_OPS_PER_CHANGE_SET]

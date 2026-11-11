"""Whole-trip AI generation: turns saved preferences into preview-only change-set ops."""

import logging
from datetime import date, timedelta
from typing import Any

from marshmallow import ValidationError

from ..ai_entities.context import TimeRules, ValidationContext
from ..ai_entities.json_types import JsonObject
from ..ai_entities.parsing import parse_date
from ..ai_entities.validators.base import EntityValidator
from ..ai_entities.validators.factory import EntityValidatorFactory
from ..exceptions import AIResponseError
from ..schemas.change_set_schema import MAX_OPS_PER_CHANGE_SET
from ..utils.db_utils import release_connection
from ..utils.progress import ProgressCallback, no_progress
from . import ai_services
from .change_set_appliers import DEFAULT_WISHLIST_NAME
from .change_set_service import build_create_op, build_event_create_ops
from .change_set_types import ChangeOp
from .itineraries_service import get_itinerary
from .trip_preferences_service import get_preferences

logger = logging.getLogger(__name__)

PLAN_SECTIONS = ("accommodations", "events", "packing_items", "wishlist_items")
PLACE_SECTIONS = ("accommodations", "events", "wishlist_items")


def trip_dates(itinerary) -> list[date]:
    dates = []
    for offset in range((itinerary.end_date - itinerary.start_date).days + 1):
        dates.append(itinerary.start_date + timedelta(days=offset))
    return dates


def trip_days(itinerary) -> list[str]:
    days = []
    for day in trip_dates(itinerary):
        days.append(day.isoformat())
    return days


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


def _valid_data(
    itinerary_id: int, validator: EntityValidator, item: Any
) -> JsonObject | None:
    data = validator.validate_create(item)
    if data is None:
        logger.warning(
            "Trip %s: dropped invalid %s %r.", itinerary_id, validator.entity, item
        )
    return data


def _event_to_op(
    itinerary_id: int, validator: EntityValidator, item: Any
) -> ChangeOp | None:
    data = _valid_data(itinerary_id, validator, item)
    if data is None:
        return None
    try:
        return build_event_create_ops([{**data, "reason": item.get("reason")}])[0]
    except ValidationError as err:
        logger.warning(
            "Trip %s: event %r failed validation: %s",
            itinerary_id,
            data["name"],
            err.messages,
        )
        return None


def _accommodation_to_op(
    itinerary, validator: EntityValidator, item: Any
) -> ChangeOp | None:
    data = _valid_data(itinerary.id, validator, item)
    if data is None:
        return None
    start, end = parse_date(data["start_date"]), parse_date(data["end_date"])
    dates = {
        "start_date": max(start, itinerary.start_date).isoformat(),
        "end_date": min(end, itinerary.end_date).isoformat(),
    }
    return build_create_op("accommodation", {**data, **dates}, item.get("reason"))


def _packing_item_to_op(
    itinerary_id: int, validator: EntityValidator, item: Any
) -> ChangeOp | None:
    data = _valid_data(itinerary_id, validator, item)
    if data is None:
        return None
    return build_create_op("packing_item", data, item.get("reason"))


def _wishlist_item_to_op(
    itinerary_id: int, validator: EntityValidator, item: Any
) -> ChangeOp | None:
    data = _valid_data(itinerary_id, validator, item)
    if data is None:
        return None
    data = {**data, "wishlist_name": DEFAULT_WISHLIST_NAME}
    return build_create_op("wishlist_item", data, item.get("reason"))


def _section(plan: dict, name: str, itinerary_id: int) -> list:
    items = plan.get(name)
    if not isinstance(items, list):
        logger.warning("Trip %s: AI plan has no usable %r list.", itinerary_id, name)
        return []
    return items


def _validators(itinerary) -> dict[str, EntityValidator]:
    context = ValidationContext(
        itinerary.timezone,
        time_rules=TimeRules(days=frozenset(trip_dates(itinerary))),
    )
    validators = {}
    for entity in ("accommodation", "event", "packing_item", "wishlist_item"):
        validators[entity] = EntityValidatorFactory.create(entity, context)
    return validators


def _convert_plan(itinerary, plan: dict, progress: ProgressCallback) -> list[ChangeOp]:
    validators = _validators(itinerary)
    converters = {
        "accommodations": lambda item: _accommodation_to_op(
            itinerary, validators["accommodation"], item
        ),
        "events": lambda item: _event_to_op(itinerary.id, validators["event"], item),
        "packing_items": lambda item: _packing_item_to_op(
            itinerary.id, validators["packing_item"], item
        ),
        "wishlist_items": lambda item: _wishlist_item_to_op(
            itinerary.id, validators["wishlist_item"], item
        ),
    }
    sections = {}
    for name in PLAN_SECTIONS:
        sections[name] = _section(plan, name, itinerary.id)
    sections["accommodations"] = sections["accommodations"][:2]
    places_total = 0
    for name in PLACE_SECTIONS:
        places_total += len(sections[name])

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
    days = trip_days(itinerary)
    prompt = _build_prompt(itinerary, get_preferences(itinerary_id), days)

    release_connection()
    progress("Asking the AI to plan your trip", None, None)
    plan = _request_plan(prompt)

    ops = _convert_plan(itinerary, plan, progress)
    if len(ops) > MAX_OPS_PER_CHANGE_SET:
        logger.warning(
            "Trip %s: truncating %s generated ops to %s.",
            itinerary_id,
            len(ops),
            MAX_OPS_PER_CHANGE_SET,
        )
    return ops[:MAX_OPS_PER_CHANGE_SET]

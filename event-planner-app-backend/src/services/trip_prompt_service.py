"""Reads a free-text trip prompt into the facts needed to create a trip."""

import logging
from dataclasses import dataclass
from datetime import date, timedelta

from marshmallow import ValidationError

from ..ai_entities.json_types import JsonObject
from ..ai_entities.parsing import as_object, clean_text, parse_date
from ..exceptions import AIResponseError
from ..models.trip_preferences_model import (
    BUDGET_TIERS,
    EDITABLE_FIELDS,
    PACE_OPTIONS,
    TRANSPORT_OPTIONS,
    TRIP_TYPES,
)
from ..schemas.trip_preferences_schema import TripPreferencesSchema
from .ai_services import format_json, get_ai_response

logger = logging.getLogger(__name__)

DEFAULT_LEAD_TIME = timedelta(days=120)
DEFAULT_TRIP_LENGTH = timedelta(days=7)
MAX_NAME_LENGTH = 255
MAX_DESTINATION_LENGTH = 255
MISSING_DESTINATION = "Say where you'd like to go, for example a city or a region."


@dataclass(frozen=True)
class TripBrief:
    name: str
    destination: str
    start_date: date
    end_date: date
    budget_amount_gbp: float | None
    preferences: JsonObject


def _options(values: tuple[str, ...]) -> str:
    return " | ".join(values)


def build_trip_brief_prompt(prompt: str, today: date) -> str:
    return f"""
You are a travel planning assistant API. Today is {today.isoformat()}.

Read the trip prompt and extract only what it states or clearly implies. Use
null for anything it does not say. Never invent a destination.

TRIP PROMPT:
\"\"\"
{prompt}
\"\"\"

REQUIREMENTS:
1. name is a short, friendly trip name, max 60 characters.
2. destination is the main city or region to visit, as you would search for it
   on a map. Use null if the prompt names no place.
3. start_date and end_date are YYYY-MM-DD. Resolve relative dates such as "next
   June" against today's date.
4. budget_amount_gbp is the total trip budget as a number in GBP.
5. Return ONLY a JSON object, with no markdown code blocks.

JSON FORMAT:

{{
  "name": "",
  "destination": "",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "budget_amount_gbp": 0,
  "preferences": {{
    "trip_type": "{_options(TRIP_TYPES)}",
    "group_size": 1,
    "vibes": ["short tags such as foodie or relaxing"],
    "budget_tier": "{_options(BUDGET_TIERS)}",
    "pace": "{_options(PACE_OPTIONS)}",
    "interests": ["short tags such as museums or hiking"],
    "transport": "{_options(TRANSPORT_OPTIONS)}"
  }}
}}
"""


def _trip_dates(raw_start: object, raw_end: object, today: date) -> tuple[date, date]:
    start = parse_date(raw_start) or today + DEFAULT_LEAD_TIME
    end = parse_date(raw_end)
    if end is None or end < start:
        end = start + DEFAULT_TRIP_LENGTH
    return start, end


def _budget(raw: object) -> float | None:
    if isinstance(raw, int | float) and not isinstance(raw, bool) and raw >= 0:
        return float(raw)
    return None


def _preferences(raw: object) -> JsonObject:
    stated = as_object(raw) or {}
    schema = TripPreferencesSchema()
    preferences: JsonObject = {}
    for field in EDITABLE_FIELDS:
        if stated.get(field) is None:
            continue
        try:
            preferences.update(schema.load({field: stated[field]}))
        except ValidationError:
            logger.warning("Dropped an unusable preference %r.", field)
    return preferences


def interpret_trip_prompt(prompt: str, today: date) -> TripBrief:
    result = format_json(get_ai_response(build_trip_brief_prompt(prompt, today)))
    stated = as_object(result)
    if stated is None:
        raise AIResponseError("AI trip brief must be an object.")

    destination = clean_text(stated.get("destination"), MAX_DESTINATION_LENGTH)
    if destination is None:
        raise ValidationError({"prompt": [MISSING_DESTINATION]})

    start_date, end_date = _trip_dates(
        stated.get("start_date"), stated.get("end_date"), today
    )
    return TripBrief(
        name=clean_text(stated.get("name"), MAX_NAME_LENGTH)
        or f"Trip to {destination}",
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        budget_amount_gbp=_budget(stated.get("budget_amount_gbp")),
        preferences=_preferences(stated.get("preferences")),
    )

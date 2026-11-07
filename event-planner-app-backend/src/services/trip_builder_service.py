"""Conversational trip builder: gathers trip details over chat, then drafts the trip."""

import logging
from dataclasses import dataclass, field
from datetime import date
from typing import Any

from marshmallow import ValidationError

from ..models.trip_preferences_model import (
    BUDGET_TIERS,
    PACE_OPTIONS,
    TRANSPORT_OPTIONS,
    TRIP_TYPES,
)
from ..schemas.itinerary_schema import ItinerarySchema
from ..schemas.trip_draft_schema import TRIP_DRAFT_FIELDS
from ..schemas.trip_preferences_schema import TripPreferencesSchema
from ..utils.location_utils import get_destination_coordinates
from .ai_services import format_chat_history, format_json, get_ai_response
from .itineraries_service import resolve_trip_timezone
from .trip_generation_service import TripBrief, generate_plan_ops

logger = logging.getLogger(__name__)

REQUIRED_DETAILS = ("destination", "start_date", "end_date")


@dataclass
class CollectedTrip:
    """What the conversation has established about the trip so far."""

    destination: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    name: str | None = None
    description: str | None = None
    preferences: dict = field(default_factory=dict)

    @property
    def missing(self) -> list[str]:
        return [key for key in REQUIRED_DETAILS if not getattr(self, key)]

    def summary(self) -> dict:
        """Everything understood so far, as JSON-friendly values."""
        details = {
            "destination": self.destination,
            "start_date": self.start_date and self.start_date.isoformat(),
            "end_date": self.end_date and self.end_date.isoformat(),
        }
        known = {key: value for key, value in details.items() if value}
        return {**known, **self.preferences}


def _build_prompt(message: str, history: list[dict], today: date) -> str:
    return f"""
You are a friendly travel assistant helping someone plan a trip by chat.
Today's date is {today.isoformat()}.

CONVERSATION SO FAR:
{format_chat_history(history)}

LATEST MESSAGE:
{message}

Work out the trip details from the whole conversation.

REQUIRED: destination, start_date and end_date (YYYY-MM-DD). Turn phrases such as
"a week in June" into concrete dates after today.
OPTIONAL PREFERENCES (only when the user said or clearly implied them):
- trip_type: one of {", ".join(TRIP_TYPES)}
- group_size: whole number of travellers
- vibes: short tags such as "relaxing" or "foodie"
- budget_tier: one of {", ".join(BUDGET_TIERS)}
- pace: one of {", ".join(PACE_OPTIONS)}
- interests: short tags such as "museums" or "hiking"
- transport: one of {", ".join(TRANSPORT_OPTIONS)}

RULES:
1. Never invent a required detail. If one is missing, ask for it in one short, friendly question.
2. Once the required details are known, you may ask one short question about who is
   travelling or what they enjoy, unless the user has already said or declined to say.
3. Set "ready" to true only when the required details are known and no question is left.
   Then "reply" is one friendly sentence introducing the draft plan.
4. Use British English. Return ONLY a JSON object, with no markdown.

JSON FORMAT:

{{
  "reply": "Your message to the user.",
  "ready": false,
  "trip": {{
    "name": "A short trip name",
    "destination": "City, Country",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "description": "One sentence, max 200 characters"
  }},
  "preferences": {{"trip_type": null, "group_size": null, "vibes": [], "budget_tier": null, "pace": null, "interests": [], "transport": null}}
}}

Use null for anything not known yet.
"""


def _text(value: Any, limit: int) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()[:limit]
    return None


def _parse_date(value: Any) -> date | None:
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def _clean_preferences(raw: Any) -> dict:
    """Keep the preference values that are valid; drop the rest and any nulls."""
    if not isinstance(raw, dict):
        return {}
    try:
        loaded = TripPreferencesSchema().load(raw)
    except ValidationError as err:
        loaded = err.valid_data
    return {key: value for key, value in loaded.items() if value not in (None, [])}


def _parse_collected(parsed: dict) -> CollectedTrip:
    trip = parsed.get("trip") if isinstance(parsed.get("trip"), dict) else {}
    collected = CollectedTrip(
        destination=_text(trip.get("destination"), 255),
        start_date=_parse_date(trip.get("start_date")),
        end_date=_parse_date(trip.get("end_date")),
        name=_text(trip.get("name"), 255),
        description=_text(trip.get("description"), 255),
        preferences=_clean_preferences(parsed.get("preferences")),
    )
    start, end = collected.start_date, collected.end_date
    if start and end and end < start:
        collected.end_date = None
    return collected


def _question(reply: str, collected: CollectedTrip) -> dict:
    return {
        "reply": reply,
        "missing": collected.missing,
        "preferences_so_far": collected.summary(),
    }


TRIP_SCHEMA = ItinerarySchema(only=TRIP_DRAFT_FIELDS)


def _draft_trip_data(collected: CollectedTrip) -> dict:
    """Validate the collected trip details, adding the destination's coordinates."""
    data = {
        "name": collected.name or f"Trip to {collected.destination}",
        "destination": collected.destination,
        "description": collected.description,
        "start_date": collected.start_date.isoformat(),
        "end_date": collected.end_date.isoformat(),
        **get_destination_coordinates(collected.destination),
    }
    return TRIP_SCHEMA.load(data)


def _build_draft(collected: CollectedTrip) -> dict:
    trip_data = _draft_trip_data(collected)
    timezone = resolve_trip_timezone(trip_data)
    ops = generate_plan_ops(
        TripBrief(
            destination=trip_data["destination"],
            start_date=trip_data["start_date"],
            end_date=trip_data["end_date"],
            timezone=timezone,
        ),
        collected.preferences,
    )
    if not ops:
        raise RuntimeError("The AI produced no plan for this trip.")
    return {
        "trip": TRIP_SCHEMA.dump(trip_data),
        "preferences": collected.preferences,
        "timezone": timezone,
        "ops": ops,
    }


def build_trip_from_chat(
    message: str, history: list[dict], today: date | None = None
) -> dict:
    """Advance the trip-building conversation by one turn (nothing is saved).

    Returns {"reply", "missing", "preferences_so_far"} while details are still
    needed, or {"reply", "draft": {trip, preferences, timezone, ops}} once the
    trip can be planned.
    """
    parsed = format_json(
        get_ai_response(_build_prompt(message, history, today or date.today()))
    )
    if not isinstance(parsed, dict):
        raise ValueError("AI response must be a JSON object.")

    collected = _parse_collected(parsed)
    reply = _text(parsed.get("reply"), 1000) or "Where and when would you like to go?"

    if parsed.get("ready") is not True or collected.missing:
        return _question(reply, collected)

    try:
        return {"reply": reply, "draft": _build_draft(collected)}
    except ValidationError:
        logger.warning("Could not locate destination %r.", collected.destination)
        collected.destination = None
        return _question(
            "I couldn't find that destination. "
            "Could you tell me the city or region again?",
            collected,
        )

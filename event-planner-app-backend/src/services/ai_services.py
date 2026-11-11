import json
import logging
import os
import re
from datetime import datetime
from typing import Any

from google import genai
from google.genai import types as genai_types
from groq import Groq

from ..ai_entities.context import TimeRules, ValidationContext
from ..ai_entities.validators.factory import EntityValidatorFactory
from ..exceptions import AIProviderError, AIResponseError
from ..utils import ai_output_validators
from ..utils.db_utils import release_connection
from ..utils.progress import ProgressCallback, no_progress
from ..utils.trip_time import to_trip_local
from .flight_context import (
    FlightWindow,
    blocked_windows,
    format_flight_context,
    windows_for_day,
)
from .itineraries_service import get_itinerary

logger = logging.getLogger(__name__)


def format_json(raw_json: str) -> Any:
    """
    Parse JSON returned by an AI model.

    Handles normal JSON as well as JSON wrapped in markdown code fences.
    """
    if not isinstance(raw_json, str):
        raise AIResponseError("AI response must be a string.")

    clean_json = raw_json.strip()

    try:
        return json.loads(clean_json)
    except json.JSONDecodeError:
        pass

    match = re.search(
        r"```(?:json)?\s*(.*?)\s*```",
        clean_json,
        re.IGNORECASE | re.DOTALL,
    )

    if match:
        clean_json = match.group(1).strip()

    if not (clean_json.startswith(("[", "{"))):
        array_start = clean_json.find("[")
        object_start = clean_json.find("{")

        starts = [
            position for position in (array_start, object_start) if position != -1
        ]

        if not starts:
            raise AIResponseError("No JSON object or array found in AI response.")

        clean_json = clean_json[min(starts) :]

    try:
        return json.loads(clean_json)
    except json.JSONDecodeError as exc:
        raise AIResponseError("AI response contained invalid JSON.") from exc


GROQ_MAX_COMPLETION_TOKENS = 8192000


def get_ai_response(prompt: str) -> str:
    """
    Get an AI response, falling back from Gemini to Groq.
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    groq_api_key = os.getenv("GROQ_API_KEY")

    if gemini_api_key:
        try:
            client_gemini = genai.Client(
                api_key=gemini_api_key,
                http_options=genai_types.HttpOptions(timeout=100000),
            )

            response = client_gemini.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
            )

            if response.text:
                return response.text

            logger.warning("Gemini returned an empty response.")

        except Exception:
            logger.exception("Gemini request failed.")

    if groq_api_key:
        try:
            client_groq = Groq(api_key=groq_api_key)

            completion = client_groq.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an encouraging travel assistant. "
                            "Use British English. "
                            "Respond ONLY with valid JSON. "
                            "Never leave JSON incomplete."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                max_completion_tokens=GROQ_MAX_COMPLETION_TOKENS,
                timeout=100.0,
            )

            choice = completion.choices[0]
            content = choice.message.content

            logger.info(
                "Groq response: finish_reason=%s, completion_tokens=%s",
                choice.finish_reason,
                completion.usage.completion_tokens,
            )

            if choice.finish_reason == "length":
                raise RuntimeError("Groq response was truncated by the token limit.")

            if content:
                return content

            logger.warning("Groq returned an empty response.")

        except Exception:
            logger.exception("Groq request failed.")

    raise AIProviderError("All AI providers failed.")


def get_insights(itinerary_id: int):
    itinerary = get_itinerary(itinerary_id)

    prompt = f"""
Return a JSON array of 3-4 travel insights for a trip to
{itinerary.destination} from {itinerary.start_date} to
{itinerary.end_date}.

Each object must have "title" and "content" keys.

Content should be no more than 2 sentences.

Include:
- weather
- packing advice
- local tips
- Common phrases in the local language

Output MUST be a JSON array only.
"""

    try:
        raw_response = get_ai_response(prompt)
        insights = format_json(raw_response)

        return ai_output_validators.validate_insights(insights)

    except (ValueError, RuntimeError) as exc:
        logger.warning(
            "Failed to generate itinerary insights: %s",
            exc,
        )
        return []


FLIGHTS_PROMPT = """

FLIGHTS (fixed; the traveller is travelling or getting to and from the airport):

{flights}

Do not suggest anything between the blocked times above. Fit only as many items as
the free time allows, even if that is fewer than the pace suggests, and suggest none
if the whole day is taken."""


def _booked_events_text(itinerary) -> str:
    lines = []
    for event in itinerary.events:
        start = to_trip_local(event.start_at, itinerary.timezone)
        end = to_trip_local(event.end_at, itinerary.timezone)
        lines.append(f"- {event.name}: {start:%Y-%m-%dT%H:%M} - {end:%Y-%m-%dT%H:%M}")
    return "\n".join(lines)


def _flights_prompt(day_flights: list[FlightWindow]) -> str:
    if not day_flights:
        return ""
    return FLIGHTS_PROMPT.format(flights=format_flight_context(day_flights))


def get_event_suggestions(
    itinerary_id: int,
    date: datetime,
    pace: str = "balanced",
    companions: str = "couple",
    transport: str = "public_transport",
    interests: list[str] | None = None,
    progress: ProgressCallback = no_progress,
):
    itinerary = get_itinerary(itinerary_id)

    interests_str = (
        ", ".join(interests) if interests else "General sightseeing and food"
    )

    booked_events = _booked_events_text(itinerary)

    requested_date = date.strftime("%Y-%m-%d")
    timezone = itinerary.timezone
    day = datetime.strptime(requested_date, "%Y-%m-%d").date()
    day_flights = windows_for_day(
        blocked_windows(itinerary.id, timezone, labelled=True), day
    )
    flights_prompt = _flights_prompt(day_flights)

    prompt = f"""
You are an expert travel planner API.

Suggest a perfectly sequenced itinerary segment of 3-4 real-world
restaurants and activities in {itinerary.destination} for
{requested_date}. The events will take place in the {timezone} timezone.

CRITICAL USER PROFILES & PREFERENCES:

- Preferred Pace: {pace}.
  - relaxed: provide 2-3 items with generous gaps.
  - balanced: provide 3-4 items with standard transitions.
  - packed: provide 4+ tightly scheduled items.

- Companion Dynamic: {companions}.
  Ensure suggestions are appropriate for this group.

- Mode of Transit: {transport}.
  Locations should be realistically reachable using this transport method.

- Core Focus Areas: {interests_str}.
  Prioritise venues matching these interests.

CONTEXT:

The user already has the following events scheduled.
Do not suggest these events and do not create timing conflicts:

{booked_events if booked_events else "No existing events."}{flights_prompt}

REQUIREMENTS:

1. Suggest real-world venues only.
2. Do not create fictional venues.
3. Provide exact venue names and addresses.
4. All events must occur on {requested_date}.
5. start_at must be before end_at.
6. Events must be chronologically ordered.
7. Do not overlap events.
8. Return ONLY a JSON array.
9. Do not use markdown code blocks.
10. start_at and end_at MUST be local wall-clock times in the {timezone} timezone, formatted as YYYY-MM-DDTHH:MM:SS with no offset or "Z".

JSON FORMAT:

[
  {{
    "name": "Exact Official Venue Name",
    "description": "Short description. Maximum 100 characters.",
    "address": "Full street address, City, Country",
    "start_at": "YYYY-MM-DDTHH:MM:SS",
    "end_at": "YYYY-MM-DDTHH:MM:SS",
    "category": "String that represents the type of activity (MAX 10 CHARACTERS, spaces between words)",
    "reason": "One short sentence (max 120 characters) on why this suits the traveller and the day"
  }}
]
"""

    release_connection()
    progress("Asking the AI for ideas", None, None)
    suggestions = format_json(get_ai_response(prompt))

    if not isinstance(suggestions, list):
        raise AIResponseError("AI suggestions must be a list.")

    validator = EntityValidatorFactory.create(
        "event",
        ValidationContext(
            timezone,
            flights=day_flights,
            time_rules=TimeRules(days=frozenset({day})),
        ),
    )
    events = []
    for index, suggestion in enumerate(suggestions, start=1):
        progress("Looking up places", index, len(suggestions))
        data = validator.validate_create(suggestion)
        if data is not None:
            events.append({**data, "reason": suggestion.get("reason")})
    return events


def generate_packing_list(itinerary_id: int, progress: ProgressCallback = no_progress):
    itinerary = get_itinerary(itinerary_id)

    duration = (itinerary.end_date - itinerary.start_date).days + 1

    booked_events = "\n".join(
        [f"- {event.name}: {event.description or ''}" for event in itinerary.events]
    )

    prompt = f"""
You are an expert travel coordinator.

Generate a highly customised packing checklist for a trip to
{itinerary.destination} from {itinerary.start_date} to
{itinerary.end_date}.

Duration: {duration} days.

Context:

Scheduled activities/events:
{booked_events if booked_events else "General sightseeing"}

Instructions:

1. Consider the typical weather for the destination during
   {itinerary.start_date.strftime("%B")}.

2. Categorise items into:
   - Clothing
   - Toiletries
   - Electronics
   - Documents
   - Specialty Gear
   - Misc

3. Tailor recommendations to the activities and expected weather. You do not need to reference the activity and item is for.

4. Provide appropriate quantities where useful.

5. Set "is_shared" to true for group/shared equipment or documents.

6. Set "is_shared" to false for individual/personal items.

Return ONLY a JSON array. Max 10 items.

Schema:

[
  {{
    "name": "Light Rain Jacket",
    "category": "Clothing",
    "is_shared": false
  }}
]
"""

    release_connection()
    progress("Asking the AI for a packing list", None, None)
    validator = EntityValidatorFactory.create(
        "packing_item", ValidationContext(itinerary.timezone)
    )
    return ai_output_validators.validate_creates(
        format_json(get_ai_response(prompt)), validator
    )


def __getattr__(name: str):
    # Whole-trip generation lives in trip_generation_service, which builds on
    # this module; resolve it lazily to avoid a circular import.
    if name == "generate_trip_plan":
        from .trip_generation_service import generate_trip_plan

        return generate_trip_plan
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

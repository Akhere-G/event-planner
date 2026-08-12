import json
import logging
import os
import re
from datetime import datetime
from typing import Any, List

import googlemaps
from google import genai
from groq import Groq

from ..utils import ai_output_validators
from .itineraries_service import get_itinerary

logger = logging.getLogger(__name__)


def format_json(raw_json: str) -> Any:
    """
    Parse JSON returned by an AI model.

    Handles normal JSON as well as JSON wrapped in markdown code fences.
    """
    if not isinstance(raw_json, str):
        raise ValueError("AI response must be a string.")

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
            raise ValueError("No JSON object or array found in AI response.")

        clean_json = clean_json[min(starts) :]

    try:
        return json.loads(clean_json)
    except json.JSONDecodeError as exc:
        raise ValueError("AI response contained invalid JSON.") from exc


def get_ai_response(prompt: str) -> str:
    """
    Get an AI response, falling back from Gemini to Groq.
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    groq_api_key = os.getenv("GROQ_API_KEY")

    if gemini_api_key:
        try:
            client_gemini = genai.Client(api_key=gemini_api_key)

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
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an encouraging travel assistant. "
                            "Use British English. "
                            "Respond ONLY with valid JSON."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                timeout=10.0,
            )

            content = completion.choices[0].message.content

            if content:
                return content

            logger.warning("Groq returned an empty response.")

        except Exception:
            logger.exception("Groq request failed.")

    raise RuntimeError("All AI providers failed.")


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


def get_event_suggestions(
    itinerary_id: int,
    date: datetime,
    pace: str = "balanced",
    companions: str = "couple",
    transport: str = "public_transport",
    interests: List[str] | None = None,
):
    itinerary = get_itinerary(itinerary_id)

    interests_str = (
        ", ".join(interests) if interests else "General sightseeing and food"
    )

    booked_events = "\n".join(
        [
            (f"- {event.name}: {event.start_at} - {event.end_at}")
            for event in itinerary.events
        ]
    )

    requested_date = date.strftime("%Y-%m-%d")

    prompt = f"""
You are an expert travel planner API.

Suggest a perfectly sequenced itinerary segment of 3-4 real-world
restaurants and activities in {itinerary.destination} for
{requested_date}.

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

{booked_events if booked_events else "No existing events."}

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

JSON FORMAT:

[
  {{
    "name": "Exact Official Venue Name",
    "description": "Short description. Maximum 100 characters.",
    "address": "Full street address, City, Country",
    "start_at": "YYYY-MM-DDTHH:MM:SSZ",
    "end_at": "YYYY-MM-DDTHH:MM:SSZ",
    "category": "String that represents the type of activity (MAX 10 CHARACTERS, spaces between words)"
  }}
]
"""

    try:
        raw_response = get_ai_response(prompt)
        suggestions = format_json(raw_response)

        if not isinstance(suggestions, list):
            return []

        valid_suggestions = [
            event
            for event in suggestions
            if ai_output_validators.validate_event_suggestion(
                event,
                requested_date,
            )
        ]

        if not valid_suggestions:
            return []

        maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")

        if not maps_api_key:
            logger.error("GOOGLE_MAPS_API_KEY is not configured.")
            return []

        gmaps = googlemaps.Client(key=maps_api_key)

        geocoded_events = []

        for event in valid_suggestions:
            try:
                results = gmaps.geocode(f"{event['name']}, {event['address']}")

                if not results:
                    logger.warning(
                        "Could not geocode suggested venue: %s",
                        event["name"],
                    )
                    continue

                location = results[0]["geometry"]["location"]

                event_with_location = {
                    **event,
                    "latitude": location["lat"],
                    "longitude": location["lng"],
                }

                geocoded_events.append(event_with_location)

            except Exception:
                logger.exception(
                    "Failed to geocode venue: %s",
                    event.get("name"),
                )

        return geocoded_events

    except (ValueError, RuntimeError) as exc:
        logger.warning(
            "Failed to generate event suggestions: %s",
            exc,
        )
        return []


def optimise_events(
    itinerary_id: int,
    event_date: datetime,
):
    itinerary = get_itinerary(itinerary_id)

    events = [
        event
        for event in itinerary.events
        if event.start_at.date() == event_date.date()
    ]

    if not events:
        return []

    event_details = "\n".join(
        [
            (
                f"- id: {event.id}, "
                f"name: {event.name}, "
                f"start_at: {event.start_at}, "
                f"end_at: {event.end_at}, "
                f"address: {event.address}, "
                f"category: {event.category}"
            )
            for event in events
        ]
    )

    prompt = f"""
You are a professional travel coordinator and logistics expert.

Task:
Reorder and adjust the timings of the provided events to create a
seamless, non-overlapping itinerary.

Constraints:

1. NO OVERLAPS:
   Ensure every event ends before the next event begins.

2. TRAVEL BUFFER:
   Allow a realistic 15-45 minute gap between consecutive events.

3. GAP MINIMISATION:
   Avoid idle gaps longer than 60 minutes unless appropriate for meals.

4. DATE INTEGRITY:
   Keep every event on {event_date.date()}.
   Only modify hours and minutes.

5. LOGICAL FLOW:
   Consider the event addresses when determining the sequence.

6. VALIDATION:
   end_at must always be strictly after start_at.

7. SAFETY:
   If an event cannot be sensibly optimised, keep its original times.

Return ONLY a JSON array.

Format:

[
  {{
    "id": 123,
    "start_at": "ISO 8601 string",
    "end_at": "ISO 8601 string"
  }}
]

Events:

{event_details}
"""

    try:
        raw_response = get_ai_response(prompt)
        optimised_events = format_json(raw_response)

        return ai_output_validators.validate_optimised_events(
            optimised_events,
            events,
            event_date,
        )

    except (ValueError, RuntimeError) as exc:
        logger.warning(
            "Failed to optimise events: %s",
            exc,
        )
        return []


def generate_packing_list(itinerary_id: int):
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

Return ONLY a JSON array.

Schema:

[
  {{
    "name": "Light Rain Jacket",
    "category": "Clothing",
    "is_shared": false
  }}
]
"""

    try:
        raw_response = get_ai_response(prompt)
        items = format_json(raw_response)

        return ai_output_validators.validate_packing_items(items)

    except (ValueError, RuntimeError) as exc:
        logger.warning(
            "Failed to generate packing list: %s",
            exc,
        )
        return []

from .itineraries_service import get_itinerary
import json
from google import genai
from groq import Groq
from datetime import datetime
import os
import googlemaps
from typing import List


def format_json(raw_json):
    clean_json = raw_json.strip()
    if "```" in clean_json:
        parts = clean_json.split("```")
        for part in parts:
            trimmed = part.strip()
            if trimmed.lower().startswith("json"):
                trimmed = trimmed[4:].strip()
            if trimmed.startswith("[") or trimmed.startswith("{"):
                clean_json = trimmed
                break

    return json.loads(clean_json)


def get_ai_response(prompt):
    try:
        client_gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client_gemini.models.generate_content(
            model="gemini-3.5-flash", contents=prompt
        )
        if response.text:
            return response.text
    except Exception as e:
        print(f"Gemini failed: {e}")

    try:
        client_groq = Groq(api_key=os.getenv("GROQ_API_KEY"))
        completion = client_groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an encouraging travel assistant. Use British English. Respond ONLY with a JSON array.",
                },
                {"role": "user", "content": prompt},
            ],
            timeout=10.0,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Groq failed: {e}")
        raise Exception("All AI providers failed.")


def get_insights(itinerary_id):
    itinerary = get_itinerary(itinerary_id)
    prompt = f"""
    Return a JSON array of 3-4 travel insights for a trip to {itinerary.destination} 
    from {itinerary.start_date} to {itinerary.end_date}.
    Each object must have "title" and "content" keys.
    Content should be no more than 2 sentences.
    Include weather, packing advice, and local tips.
    Output MUST be a JSON array only.
    """

    raw_response = get_ai_response(prompt)
    try:
        insights = format_json(raw_response)

        if not isinstance(insights, list):
            return []
        return insights
    except Exception as e:
        print(f"JSON Parsing failed: {e}")
        return []


"string (Optional but use it to provide important context and tips)"


def get_event_suggestions(
    itinerary_id,
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

    booked_events = "\n".join([f"- {event.name}" for event in itinerary.events])
    prompt = f"""
      You are an expert travel planner API. Suggest a perfectly sequenced itinerary segment of 3-4 real-world restaurants and activities in {itinerary.destination} for the date {date.strftime("%Y-%m-%d")}.

      CRITICAL USER PROFILES & PREFERENCES:
      - Preferred Pace: {pace}. 
        * If 'relaxed': provide 2-3 items max with generous 2+ hour gaps.
        * If 'balanced': provide 3-4 items with standard 1-hour transitions.
        * If 'packed': provide 4+ tightly scheduled items.
      - Companion Dynamic: {companions}. Ensure all suggested venues, ambiance, and age-appropriateness strictly match this group structure.
      - Mode of Transit: {transport}. Only pick clusters of locations that are logistically realistic to travel between using this method.
      - Core Focus Areas: {interests_str}. Prioritize real venues that map directly to these interests.

      CONTEXT (DO NOT DUPLICATE THESE):
      The user already has the following items scheduled for this trip. Do not suggest them, and ensure your recommendations do not conflict with their timings:
      {booked_events}
      
      STRICT SYSTEM REQUIREMENTS:
      1. Location Accuracy: Every venue must be a real, currently open establishment physically located within {itinerary.destination}.
      2. No placeholders: Do not generate fictional places, approximate addresses, or placeholder text.
      3. Valid ISO Timestamps: Construct exact 'start_at' and 'end_at' strings matching the date "{date.strftime("%Y-%m-%d")}" (e.g., "{date.strftime("%Y-%m-%d")}T14:30:00Z"). Arrange them chronologically without overlaps.
      4. Output Rule: Return ONLY a raw JSON array of objects matching the schema below. Do not include markdown code blocks, backticks (```json), or any conversational pre/post-text.

      JSON SCHEMA FORMAT:
      [
        {{
          "name": "Exact Official Venue Name",
          "description": "A compelling description explaining what the activity is, context and local insider tips. (MAX 100 characters)",
          "address": "Full street address, City, Country",
          "start_at": "YYYY-MM-DDTHH:MM:SSZ",
          "end_at": "YYYY-MM-DDTHH:MM:SSZ",
          "category": "String that represents the type of activity (MAX 10 CHARACTERS, spaces between words)"
        }}
      ]
    """

    try:
        raw_response = get_ai_response(prompt)

        gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

        suggestions = format_json(raw_response)

        geocoded_events = []

        for event in suggestions:
            result = gmaps.geocode(f"{event['name']}, {event['address']}")  # type: ignore
            if result:
                location = result[0]["geometry"]["location"]
                event["latitude"] = location["lat"]
                event["longitude"] = location["lng"]
                geocoded_events.append(event)

        return geocoded_events
    except Exception as e:
        print(f"JSON Parsing failed: {e}")
        return []


def optimise_events(itinerary_id, event_date: datetime):
    itinerary = get_itinerary(itinerary_id)
    events = [
        event
        for event in itinerary.events
        if event.start_at.date() == event_date.date()
    ]

    event_details = "\n".join(
        [
            f"- id: {event.id}, name: {event.name}, start date: {event.start_at}, end_date {event.end_at}, category: {event.category}"
            for event in events
        ]
    )

    prompt = f"""
      System Role: You are a professional travel coordinator and logistics expert.
      
      Task: Reorder and adjust the timings of the provided events to create a seamless, non-overlapping itinerary.
      
      Constraints:
      1. NO OVERLAPS: Ensure every event ends before the next one begins.
      2. TRAVEL BUFFER: Allot a realistic 15-45 minute gap between consecutive events for transit.
      3. GAP MINIMISATION: Avoid idle gaps longer than 60 minutes unless the event is a food or restaurant event, to allow for usual dining hours.
      4. DATE INTEGRITY: You MUST keep the same Year, Month, and Day. Only modify the Hours and Minutes.
      5. LOGICAL FLOW: Ensure the sequence makes geographic sense based on the event names and addresses.
      6. VALIDATION: 'end_at' must always be strictly after 'start_at'.
      7. SAFETY: Keep the old 'start_at' and 'end_at' times for any event you cannot optimise.

      Output Format:
      Return a valid JSON array of objects only. Do not include any preamble or markdown formatting.
      Format:
      {{
        "id": "int",
        "start_at": "ISO 8601 string",
        "end_at": "ISO 8601 string"
      }}

      Events to Process:
      {event_details}
    """

    try:
        raw_json = get_ai_response(prompt)
        events = format_json(raw_json)
        return events
    except Exception as e:
        print(f"JSON Parsing failed: {e}")
        return []


def generate_packing_list(itinerary_id: int):
    itinerary = get_itinerary(itinerary_id)
    duration = (itinerary.end_date - itinerary.start_date).days + 1
    booked_events = "\n".join(
        [f"- {event.name}: {event.description or ''}" for event in itinerary.events]
    )

    prompt = f"""
    You are an expert travel coordinator. Generate a highly customized packing checklist for a trip to {itinerary.destination}
    from {itinerary.start_date} to {itinerary.end_date} (duration: {duration} days).

    Context:
    - Scheduled Activities/Events:
    {booked_events if booked_events else "General sightseeing"}

    Instructions:
    1. Infer the typical weather for {itinerary.destination} during {itinerary.start_date.strftime("%B")}.
    2. Categorize items into: "Clothing", "Toiletries", "Electronics", "Documents", "Specialty Gear", or "Misc".
    3. Tailor recommendations directly to the activities and weather (e.g. swimwear/sunscreen for beach/swimming, formal wear for dining, walking shoes, rain jacket, charger, passport/ID, etc.).
    4. Provide appropriate item quantities where applicable (e.g., "5x Shirts", "3x Socks").
    5. Mark items as "is_shared": true for group gear/shared documents, and "is_shared": false for individual clothing/personal items.
    
    Output MUST be a raw JSON array of objects only. No markdown code block wraps.
    Schema:
    [
      {{"name": "Light Rain Jacket", "category": "Clothing", "is_shared": false}},
      {{"name": "First Aid Kit", "category": "Specialty Gear", "is_shared": true}}
    ]
    """

    raw_response = get_ai_response(prompt)
    try:
        items = format_json(raw_response)
        if not isinstance(items, list):
            return []
        return items
    except Exception as e:
        print(f"Packing AI JSON parsing failed: {e}")
        return []

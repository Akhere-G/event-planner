from .itineraries_service import get_itinerary
import json
from google import genai
from groq import Groq
from datetime import datetime
import os
import googlemaps


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
            model="gemini-2.0-flash", contents=prompt
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


def get_event_suggestions(itinerary_id, date: datetime):
    itinerary = get_itinerary(itinerary_id)

    booked_events = "\n".join([f"- {event.name}" for event in itinerary.events])
    prompt = f"""
      Suggest 3-4 restaurants and activities in {itinerary.destination} on {date.strftime("%Y-%m-%d")}.
      
      CONTEXT:
      Currently booked: {booked_events}
      
      REQUIREMENTS:
      1. Provide real-world venues located specifically in {itinerary.destination}.
      2. For coordinates, ensure they are precise for the specific venue.
      3. Respond ONLY with a JSON array of objects.

      FORMAT:
      {{
        "name": "string",
        "description": "string (Optional but use it to provide important context and tips)" ,
        "address": "full street address, {itinerary.destination}",
        "start_at": "ISO string,
        "end_at": "ISO string",
        "category": "string"
      }}
    """

    try:
        raw_response = get_ai_response(prompt)

        gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

        suggestions = format_json(raw_response)

        geocoded_events = []

        for event in suggestions:
            result = gmaps.geocode(f"{event['name']}, {event['address']}")
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

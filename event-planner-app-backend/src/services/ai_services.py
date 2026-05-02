from .itineraries_service import get_itinerary
import json
import google.generativeai as genai
from groq import Groq

import os


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
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
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

import hashlib
import logging
import os
from functools import lru_cache

import googlemaps
import requests
from marshmallow import ValidationError

from ..extensions import cache

logger = logging.getLogger(__name__)

OPENING_HOURS_CACHE_SECONDS = 24 * 60 * 60
PLACE_PHOTO_URL = "https://maps.googleapis.com/maps/api/place/photo"
PLACE_PHOTO_MAX_WIDTH = 800


@lru_cache(maxsize=4)
def _client(api_key: str | None) -> googlemaps.Client:
    return googlemaps.Client(key=api_key, timeout=10)


def _gmaps() -> googlemaps.Client:
    return _client(os.getenv("GOOGLE_MAPS_API_KEY"))


def _find_place_id(name: str, address: str | None, place_type: str | None) -> str:
    places_result = _gmaps().places(
        query=f"{name}, {address or ''}",
        type=place_type,
    )

    if not places_result["results"]:
        raise ValidationError({"address": ["Cannot find place."]})

    return places_result["results"][0]["place_id"]


def get_place_details(
    name: str,
    address: str | None = None,
    place_type: str | None = "establishment",
) -> dict[str, str | float]:
    place_id = _find_place_id(name, address, place_type)

    place_details = _gmaps().place(
        place_id=place_id,
        fields=["geometry", "formatted_address"],
    )

    result = place_details.get("result", {})

    location = result.get("geometry", {}).get("location")
    formatted_address = result.get("formatted_address")

    if not location or not formatted_address:
        raise ValidationError({"address": ["Cannot find place details."]})

    return {
        "latitude": location["lat"],
        "longitude": location["lng"],
        "formatted_address": formatted_address,
    }


def get_weekly_opening_hours(name: str, address: str | None = None) -> list[str] | None:
    """The place's opening hours as seven lines, Monday first, or None if unknown.

    Cached for a day: opening hours are a billed Places field and rarely change.
    """
    key = "place-hours:" + hashlib.sha1(f"{name}|{address}".encode()).hexdigest()
    cached = cache.get(key)
    if cached is not None:
        return cached or None

    try:
        place_id = _find_place_id(name, address, "establishment")
        result = _gmaps().place(place_id=place_id, fields=["opening_hours"])
        hours = result.get("result", {}).get("opening_hours", {}).get("weekday_text")
    except Exception:
        logger.warning("Could not fetch opening hours for %r.", name, exc_info=True)
        return None

    cache.set(key, hours or [], timeout=OPENING_HOURS_CACHE_SECONDS)
    return hours or None


def find_place_photo_url(name: str, address: str | None) -> str | None:
    """A URL for the place's first Google photo, or None if it has none.

    The photo endpoint redirects to a googleusercontent URL; storing that target
    instead of the endpoint keeps the server API key out of the browser.
    """
    try:
        results = _gmaps().places(query=f"{name}, {address or ''}")["results"]
        if not results or not results[0].get("photos"):
            return None
        response = requests.get(
            PLACE_PHOTO_URL,
            params={
                "maxwidth": PLACE_PHOTO_MAX_WIDTH,
                "photo_reference": results[0]["photos"][0]["photo_reference"],
                "key": os.getenv("GOOGLE_MAPS_API_KEY"),
            },
            allow_redirects=False,
            timeout=10,
        )
    except Exception:
        logger.warning("Could not fetch a photo for %r.", name, exc_info=True)
        return None
    return response.headers.get("Location")

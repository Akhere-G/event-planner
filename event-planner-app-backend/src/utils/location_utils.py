from typing import Optional
import os
import googlemaps
from marshmallow import ValidationError


def get_place_details(
    name: str,
    address: Optional[str] = None,
    place_type: str = "establishment",
) -> dict[str, str | float]:
    gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

    query = f"{name}, {address or ''}"

    places_result = gmaps.places(
        query=query,
        type=place_type,
    )

    if not places_result["results"]:
        raise ValidationError({"address": ["Cannot find place."]})

    place = places_result["results"][0]

    place_details = gmaps.place(
        place_id=place["place_id"],
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

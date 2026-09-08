import logging
import os
import time
from typing import Optional

import googlemaps
from marshmallow import ValidationError

logger = logging.getLogger(__name__)


def get_timezone_for_coordinates(
    latitude: float,
    longitude: float,
    timestamp: Optional[int] = None,
) -> str:

    if not (-90 <= latitude <= 90):
        raise ValidationError({"latitude": ["Latitude must be between -90 and 90."]})
    if not (-180 <= longitude <= 180):
        raise ValidationError(
            {"longitude": ["Longitude must be between -180 and 180."]}
        )

    if timestamp is None:
        timestamp = int(time.time())

    try:
        gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

        timezone_result = gmaps.timezone(
            location=(latitude, longitude),
            timestamp=timestamp,
        )

        if timezone_result.get("status") != "OK":
            error_message = timezone_result.get("error_message", "Unknown error")
            logger.error(f"Google Maps Time Zone API error: {error_message}")
            raise ValidationError(
                {"timezone": [f"Failed to determine timezone: {error_message}"]}
            )

        timezone_id = timezone_result.get("timeZoneId")
        if not timezone_id:
            logger.error("Google Maps Time Zone API returned no timeZoneId")
            raise ValidationError({"timezone": ["Failed to determine timezone ID."]})

        logger.info(
            f"Determined timezone {timezone_id} for coordinates ({latitude}, {longitude})"
        )
        return timezone_id

    except googlemaps.exceptions.ApiError as e:
        logger.error(f"Google Maps API error: {e}")
        raise ValidationError({"timezone": [f"Google Maps API error: {str(e)}"]})
    except Exception as e:
        logger.exception(f"Unexpected error determining timezone: {e}")
        raise ValidationError({"timezone": [f"Failed to determine timezone: {str(e)}"]})

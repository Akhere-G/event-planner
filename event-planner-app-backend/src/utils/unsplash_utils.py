import logging
import os

import requests

from ..models import BackgroundImage

logger = logging.getLogger(__name__)

UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"
REQUEST_TIMEOUT_SECONDS = 10


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Client-ID {os.getenv('UNSPLASH_ACCESS_KEY')}",
        "Accept-Version": "v1",
    }


def find_destination_image(destination: str) -> BackgroundImage | None:
    """A landscape Unsplash photo of the destination, or None if there is none.

    Unsplash's API terms require hotlinking its image URL, crediting the
    photographer and requesting the photo's download_location once it is used.
    """
    try:
        response = requests.get(
            UNSPLASH_SEARCH_URL,
            params={
                "query": destination,
                "orientation": "landscape",
                "content_filter": "high",
                "per_page": 1,
            },
            headers=_headers(),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        results = response.json()["results"]
        if not results:
            return None
        photo = results[0]
        requests.get(
            photo["links"]["download_location"],
            headers=_headers(),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except Exception:
        logger.warning("Could not fetch a photo of %r.", destination, exc_info=True)
        return None
    return BackgroundImage(
        url=photo["urls"]["regular"],
        credit_name=photo["user"]["name"],
        credit_url=photo["user"]["links"]["html"],
    )

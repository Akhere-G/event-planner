import logging
from collections.abc import Iterable
from typing import TypedDict

from ..utils.location_utils import get_place_details

logger = logging.getLogger(__name__)


class Place(TypedDict):
    latitude: float
    longitude: float
    address: str


class PlaceResolver:
    """Finds where an AI-named place is, reusing a saved place before looking it up."""

    def __init__(self, saved: Iterable[Place] = ()) -> None:
        self._saved: dict[str, Place] = {}
        for place in saved:
            self._saved[self._key(place["address"])] = place

    @staticmethod
    def _key(address: str) -> str:
        return " ".join(address.casefold().split())

    def resolve(
        self, name: str, address: str | None, place_type: str = "establishment"
    ) -> Place | None:
        if address and self._key(address) in self._saved:
            return self._saved[self._key(address)]
        try:
            details = get_place_details(name, address, place_type)
        except Exception:
            logger.exception("Could not find %r (address %r).", name, address)
            return None
        return Place(
            latitude=float(details["latitude"]),
            longitude=float(details["longitude"]),
            address=str(details.get("formatted_address") or address or ""),
        )

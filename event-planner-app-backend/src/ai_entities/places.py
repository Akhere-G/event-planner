import logging
from collections.abc import Iterable
from dataclasses import dataclass

from ..utils.location_utils import get_place_details
from .json_types import JsonObject

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Place:
    latitude: float
    longitude: float
    address: str

    def as_data(self) -> JsonObject:
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "address": self.address,
        }

    @classmethod
    def from_values(cls, values: JsonObject) -> "Place | None":
        latitude, longitude = values.get("latitude"), values.get("longitude")
        address = values.get("address")
        if (
            isinstance(latitude, int | float)
            and isinstance(longitude, int | float)
            and isinstance(address, str)
        ):
            return cls(float(latitude), float(longitude), address)
        return None


class PlaceResolver:
    """Finds where an AI-named place is, reusing a saved place before looking it up."""

    def __init__(self, saved: Iterable[Place] = ()) -> None:
        self._saved: dict[str, Place] = {}
        for place in saved:
            self._saved[self._key(place.address)] = place

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

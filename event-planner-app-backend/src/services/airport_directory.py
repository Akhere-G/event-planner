import re
from dataclasses import dataclass, field
from functools import lru_cache
from math import asin, cos, radians, sin, sqrt

import airportsdata

IATA_PATTERN = re.compile(r"^[A-Za-z]{3}$")


@dataclass(frozen=True)
class AirportInfo:
    code: str
    name: str
    city: str
    country: str
    latitude: float
    longitude: float
    timezone: str

    @property
    def address(self) -> str:
        return f"{self.city}, {self.country}"


@dataclass(frozen=True)
class Place:
    """A city and the airports that serve it."""

    label: str
    airports: tuple[AirportInfo, ...]
    distance_km: float | None = field(default=None, compare=False)


@lru_cache(maxsize=1)
def _airports_by_code() -> dict[str, AirportInfo]:
    return {
        code: AirportInfo(
            code=code,
            name=record["name"],
            city=record["city"],
            country=record["country"],
            latitude=record["lat"],
            longitude=record["lon"],
            timezone=record["tz"],
        )
        for code, record in airportsdata.load("IATA").items()
        if record["tz"]
    }


@lru_cache(maxsize=1)
def _places() -> tuple[Place, ...]:
    grouped: dict[tuple[str, str], list[AirportInfo]] = {}
    for airport in _airports_by_code().values():
        grouped.setdefault((airport.city, airport.country), []).append(airport)

    return tuple(
        Place(label=f"{city}, {country}", airports=tuple(airports))
        for (city, country), airports in grouped.items()
    )


def get_airport_info(code: str) -> AirportInfo | None:
    return _airports_by_code().get(code.upper())


MEAN_EARTH_RADIUS = 6371


def _distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """calculates the distance in kilometres between two geographical coordinates (latitude and longitude) using the Haversine formula."""
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    )
    return MEAN_EARTH_RADIUS * 2 * asin(sqrt(a))


def _place_distance(place: Place, lat: float, lng: float) -> float:
    return min(
        _distance_km(lat, lng, airport.latitude, airport.longitude)
        for airport in place.airports
    )


def _match_rank(place: Place, query: str) -> int | None:
    city = place.airports[0].city.lower()
    if city == query:
        return 1
    if city.startswith(query):
        return 2
    if query in city:
        return 3
    if any(query in airport.name.lower() for airport in place.airports):
        return 4
    return None


def search_places(
    query: str,
    lat: float | None = None,
    lng: float | None = None,
    limit: int = 10,
) -> list[Place]:
    """Find cities (with their airports) matching a city, airport name or IATA code.

    When coordinates are given the closest matches come first, so "Paris" resolves
    to Paris, France for a trip in France rather than Paris, Texas.
    """
    query = query.strip().lower()
    if not query:
        return []

    results: list[Place] = []

    if IATA_PATTERN.match(query):
        airport = get_airport_info(query)
        if airport:
            results.append(
                Place(label=f"{airport.name} ({airport.code})", airports=(airport,))
            )

    has_coordinates = lat is not None and lng is not None
    matches: list[Place] = []
    ranks: dict[str, int] = {}
    for place in _places():
        rank = _match_rank(place, query)
        if rank is None:
            continue
        ranks[place.label] = rank
        distance = _place_distance(place, lat, lng) if has_coordinates else None
        matches.append(
            Place(label=place.label, airports=place.airports, distance_km=distance)
        )

    matches.sort(
        key=lambda place: (
            ranks[place.label],
            place.distance_km if place.distance_km is not None else float("inf"),
            place.label,
        )
    )
    results.extend(matches)

    return results[:limit]

import os
import re
from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo

import requests

from ...exceptions import FlightProviderError
from ..airport_directory import AirportInfo, get_airport_info
from .base import FlightApiProvider, FlightJourney, FlightOffer

API_URL = "https://serpapi.com/search"
REQUEST_TIMEOUT_SECONDS = 10
ONE_WAY = 2
BAGGAGE_PATTERN = re.compile(r"\bbag", re.IGNORECASE)


class SerpApiFlightProvider(FlightApiProvider):
    name = "serpapi"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.getenv("SERPAPI_API_KEY")

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def search(
        self,
        origin_codes: list[str],
        destination_codes: list[str],
        departure_date: date,
    ) -> list[FlightJourney]:
        payload = self._request(origin_codes, destination_codes, departure_date)

        purchase_url = payload.get("search_metadata", {}).get("google_flights_url")

        journeys = []
        try:
            for itinerary in payload.get("best_flights", []):
                journeys.append(self._to_journey(itinerary, purchase_url))
        except (KeyError, TypeError, ValueError) as exc:
            raise FlightProviderError(
                "SerpApi returned an unexpected response."
            ) from exc
        return journeys

    def _request(
        self,
        origin_codes: list[str],
        destination_codes: list[str],
        departure_date: date,
    ) -> dict:
        params = {
            "engine": "google_flights",
            "departure_id": ",".join(origin_codes),
            "arrival_id": ",".join(destination_codes),
            "outbound_date": departure_date.isoformat(),
            "type": ONE_WAY,
            "currency": "GBP",
            "hl": "en",
            "api_key": self.api_key,
        }

        try:
            response = requests.get(
                API_URL, params=params, timeout=REQUEST_TIMEOUT_SECONDS
            )
            response.raise_for_status()
            payload = response.json()
        except (requests.RequestException, ValueError) as exc:
            raise FlightProviderError("SerpApi request failed.") from exc

        # SerpApi reports "no results" as an error: an empty search, not an outage.
        error = payload.get("error")
        if error and "hasn't returned any results" not in error:
            raise FlightProviderError(f"SerpApi error: {error}")

        return payload

    def _to_journey(self, itinerary: dict, purchase_url: str | None) -> FlightJourney:
        luggage = self._luggage_notes(itinerary)

        legs = []
        for leg in itinerary["flights"]:
            legs.append(self._to_offer(leg, luggage, purchase_url))
        if not legs:
            raise ValueError("Itinerary has no flights.")

        return FlightJourney(legs=tuple(legs), price_gbp=itinerary.get("price"))

    @staticmethod
    def _luggage_notes(itinerary: dict) -> tuple[str, ...]:
        notes = []
        for note in itinerary.get("extensions", []):
            if BAGGAGE_PATTERN.search(note):
                notes.append(note)
        return tuple(notes)

    def _to_offer(
        self, leg: dict, luggage: tuple[str, ...], purchase_url: str | None
    ) -> FlightOffer:
        airline_code, _, number = leg["flight_number"].partition(" ")
        depart_at, departure = self._to_utc(
            leg["departure_airport"]["time"], leg["departure_airport"]["id"]
        )
        arrive_at, arrival = self._to_utc(
            leg["arrival_airport"]["time"], leg["arrival_airport"]["id"]
        )

        return FlightOffer(
            airline=airline_code,
            flight_number=number,
            departure_airport=departure.code,
            departure_airport_name=departure.name,
            departure_city=departure.city,
            arrival_airport=arrival.code,
            arrival_airport_name=arrival.name,
            arrival_city=arrival.city,
            departure_timezone=departure.timezone,
            arrival_timezone=arrival.timezone,
            depart_at=depart_at,
            arrive_at=arrive_at,
            duration_minutes=int(leg["duration"]),
            airline_logo=leg.get("airline_logo"),
            travel_class=leg.get("travel_class"),
            luggage=luggage,
            extras=tuple(leg.get("extensions", [])),
            purchase_url=purchase_url,
        )

    @staticmethod
    def _to_utc(local_time: str, airport_code: str) -> tuple[datetime, AirportInfo]:
        airport = get_airport_info(airport_code)
        if airport is None:
            raise ValueError(f"Unknown airport {airport_code}.")

        local = datetime.strptime(local_time, "%Y-%m-%d %H:%M")
        zone = ZoneInfo(airport.timezone)
        return local.replace(tzinfo=zone).astimezone(UTC), airport

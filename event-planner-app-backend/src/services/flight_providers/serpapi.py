import os
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

import requests

from ...exceptions import FlightProviderError
from ..airport_directory import get_airport_info
from .base import FlightApiProvider, FlightOffer

API_URL = "https://serpapi.com/search"
REQUEST_TIMEOUT_SECONDS = 10
ONE_WAY = 2
NONSTOP = 1


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
    ) -> list[FlightOffer]:
        payload = self._request(origin_codes, destination_codes, departure_date)

        try:
            return [
                offer
                for itinerary in payload.get("best_flights", [])
                if (offer := self._to_offer(itinerary)) is not None
            ]
        except (KeyError, TypeError, ValueError) as exc:
            raise FlightProviderError(
                "SerpApi returned an unexpected response."
            ) from exc

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
            "stops": NONSTOP,
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

        # SerpApi reports "no results" as an error; that is an empty search, not an outage.
        error = payload.get("error")
        if error and "hasn't returned any results" not in error:
            raise FlightProviderError(f"SerpApi error: {error}")

        return payload

    def _to_offer(self, itinerary: dict) -> FlightOffer | None:
        legs = itinerary["flights"]
        if len(legs) != 1:
            return None

        leg = legs[0]
        airline_code, _, number = leg["flight_number"].partition(" ")
        departure_code = leg["departure_airport"]["id"]
        arrival_code = leg["arrival_airport"]["id"]

        depart_at, departure_timezone = self._to_utc(
            leg["departure_airport"]["time"], departure_code
        )
        arrive_at, arrival_timezone = self._to_utc(
            leg["arrival_airport"]["time"], arrival_code
        )

        return FlightOffer(
            airline=airline_code,
            flight_number=number,
            departure_airport=departure_code,
            arrival_airport=arrival_code,
            departure_timezone=departure_timezone,
            arrival_timezone=arrival_timezone,
            depart_at=depart_at,
            arrive_at=arrive_at,
            duration_minutes=int(leg["duration"]),
            price=itinerary.get("price"),
            airline_logo=leg.get("airline_logo"),
        )

    @staticmethod
    def _to_utc(local_time: str, airport_code: str) -> tuple[datetime, str]:
        airport = get_airport_info(airport_code)
        if airport is None:
            raise ValueError(f"Unknown airport {airport_code}.")

        local = datetime.strptime(local_time, "%Y-%m-%d %H:%M")
        utc = local.replace(tzinfo=ZoneInfo(airport.timezone)).astimezone(timezone.utc)
        return utc, airport.timezone

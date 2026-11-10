import os
import re
from datetime import UTC, date, datetime

import requests

from ...exceptions import FlightProviderError
from .airports import require_airport
from .base import FlightJourney, FlightNumberProvider, FlightOffer

API_URL = "https://api.oag.com/flight-instances/"
REQUEST_TIMEOUT_SECONDS = 10
MAX_LEGS = 10
API_VERSION = "v2"
LEADING_DIGITS = re.compile(r"^\d+")


class OagFlightProvider(FlightNumberProvider):
    """Finds the legs of a flight number with OAG's Flight Info API (v2)."""

    name = "oag"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.getenv("OAG_API_KEY")

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def lookup(
        self, airline: str, flight_number: str, departure_date: date
    ) -> list[FlightJourney]:
        records = self._request(airline, flight_number, departure_date)

        legs = []
        try:
            for record in records:
                leg = self._to_leg(record)
                if leg.flight_number == flight_number:
                    legs.append(leg)
        except (KeyError, TypeError, ValueError) as exc:
            raise FlightProviderError("OAG returned an unexpected response.") from exc

        if not legs:
            return []

        legs.sort(key=lambda leg: leg.depart_at)
        return [FlightJourney(legs=tuple(legs))]

    def _request(
        self, airline: str, flight_number: str, departure_date: date
    ) -> list[dict]:
        params = {
            "CarrierCode": airline,
            "FlightNumber": LEADING_DIGITS.match(flight_number).group(),
            "DepartureDateTime": departure_date.isoformat(),
            "CodeType": "IATA",
            "Limit": MAX_LEGS,
            "version": API_VERSION,
        }

        try:
            response = requests.get(
                API_URL,
                params=params,
                headers={"Subscription-Key": self.api_key},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            return response.json()["data"]
        except (requests.RequestException, KeyError, TypeError, ValueError) as exc:
            raise FlightProviderError("OAG request failed.") from exc

    def _to_leg(self, record: dict) -> FlightOffer:
        departure_point = record["departure"]
        arrival_point = record["arrival"]
        departure = require_airport(departure_point["airport"]["iata"])
        arrival = require_airport(arrival_point["airport"]["iata"])
        depart_at = self._utc_time(departure_point)
        arrive_at = self._utc_time(arrival_point)

        suffix = record.get("serviceSuffix") or ""
        elapsed = arrive_at - depart_at

        return FlightOffer(
            airline=record["carrier"]["iata"],
            flight_number=f"{record['flightNumber']}{suffix}",
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
            duration_minutes=int(elapsed.total_seconds() // 60),
        )

    @staticmethod
    def _utc_time(point: dict) -> datetime:
        utc_date = point["date"]["utc"]
        utc_time = point["time"]["utc"]
        return datetime.fromisoformat(f"{utc_date}T{utc_time}").replace(tzinfo=UTC)

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime


@dataclass(frozen=True)
class FlightOffer:
    airline: str
    flight_number: str
    departure_airport: str
    departure_airport_name: str
    departure_city: str
    arrival_airport: str
    arrival_airport_name: str
    arrival_city: str
    departure_timezone: str
    arrival_timezone: str
    depart_at: datetime
    arrive_at: datetime
    duration_minutes: int
    price_gbp: int | None = None
    airline_logo: str | None = None
    travel_class: str | None = None
    luggage: tuple[str, ...] = ()
    extras: tuple[str, ...] = ()
    purchase_url: str | None = None


class FlightApiProvider(ABC):
    """Adapter between a third-party flight search API and our `FlightOffer`s."""

    name: str

    @abstractmethod
    def is_configured(self) -> bool:
        """Whether the provider has the credentials it needs to run."""

    @abstractmethod
    def search(
        self,
        origin_codes: list[str],
        destination_codes: list[str],
        departure_date: date,
    ) -> list[FlightOffer]:
        """Return the best nonstop one-way flights for the route and date.

        Raises `FlightProviderError` when the provider cannot answer.
        """

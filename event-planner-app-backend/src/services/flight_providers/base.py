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
    airline_logo: str | None = None
    travel_class: str | None = None
    luggage: tuple[str, ...] = ()
    extras: tuple[str, ...] = ()
    purchase_url: str | None = None


@dataclass(frozen=True)
class FlightJourney:
    """One bookable trip: a nonstop flight, or several legs flown in order."""

    legs: tuple[FlightOffer, ...]
    price_gbp: int | None = None

    @property
    def first_leg(self) -> FlightOffer:
        return self.legs[0]

    @property
    def last_leg(self) -> FlightOffer:
        return self.legs[-1]

    @property
    def stops(self) -> int:
        return len(self.legs) - 1

    @property
    def purchase_url(self) -> str | None:
        return self.first_leg.purchase_url

    @property
    def total_duration_minutes(self) -> int:
        elapsed = self.last_leg.arrive_at - self.first_leg.depart_at
        return int(elapsed.total_seconds() // 60)

    @property
    def leg_codes(self) -> tuple[tuple[str, str], ...]:
        """The (airline, flight number) of every leg, which identifies the journey."""
        codes = []
        for leg in self.legs:
            codes.append((leg.airline, leg.flight_number))
        return tuple(codes)


class FlightApiProvider(ABC):
    """Adapter between a third-party flight search API and our `FlightJourney`s."""

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
    ) -> list[FlightJourney]:
        """Return the best one-way journeys, with or without stops, for the route.

        Raises `FlightProviderError` when the provider cannot answer.
        """

from dataclasses import replace
from datetime import UTC, datetime
from decimal import Decimal

from src.exceptions import FlightProviderError, FxUnavailableError
from src.services.ai_providers.base import AiProvider
from src.services.fx_provider import PublishedRate, RateProvider
from src.services.flight_providers import (
    FlightApiProvider,
    FlightJourney,
    FlightNumberProvider,
    FlightOffer,
)

BA117 = FlightOffer(
    airline="BA",
    flight_number="117",
    departure_airport="LHR",
    departure_airport_name="London Heathrow Airport",
    departure_city="London",
    arrival_airport="JFK",
    arrival_airport_name="John F Kennedy International Airport",
    arrival_city="New York",
    departure_timezone="Europe/London",
    arrival_timezone="America/New_York",
    depart_at=datetime(2026, 8, 1, 10, tzinfo=UTC),
    arrive_at=datetime(2026, 8, 1, 18, tzinfo=UTC),
    duration_minutes=480,
    airline_logo="https://logo/ba.png",
    travel_class="Economy",
    luggage=("1 cabin bag included",),
    extras=("Average legroom (31 in)", "Carbon emissions estimate: 292 kg"),
    purchase_url="https://www.google.com/travel/flights?q=lhr-jfk",
)

BA117_JOURNEY = FlightJourney(legs=(BA117,), price_gbp=520)

LHR_TO_AMS = replace(
    BA117,
    flight_number="427",
    arrival_airport="AMS",
    arrival_airport_name="Amsterdam Airport Schiphol",
    arrival_city="Amsterdam",
    arrival_timezone="Europe/Amsterdam",
    depart_at=datetime(2026, 8, 1, 7, tzinfo=UTC),
    arrive_at=datetime(2026, 8, 1, 8, 15, tzinfo=UTC),
    duration_minutes=75,
    luggage=(),
    extras=(),
)
AMS_TO_JFK = replace(
    BA117,
    airline="KL",
    flight_number="641",
    departure_airport="AMS",
    departure_airport_name="Amsterdam Airport Schiphol",
    departure_city="Amsterdam",
    departure_timezone="Europe/Amsterdam",
    depart_at=datetime(2026, 8, 1, 9, 30, tzinfo=UTC),
    arrive_at=datetime(2026, 8, 1, 17, 30, tzinfo=UTC),
    luggage=(),
    extras=(),
)
CONNECTION = FlightJourney(legs=(LHR_TO_AMS, AMS_TO_JFK), price_gbp=310)

KL1000_JOURNEY = FlightJourney(
    legs=(
        replace(LHR_TO_AMS, airline="KL", flight_number="1000"),
        replace(AMS_TO_JFK, airline="KL", flight_number="1000"),
    )
)


class FakeAiProvider(AiProvider):
    def __init__(self, name, text="", available=True, error=None):
        self.name = name
        self.text = text
        self.available = available
        self.error = error
        self.prompts = []

    def is_available(self) -> bool:
        return self.available

    def generate(self, prompt: str) -> str:
        self.prompts.append(prompt)
        if self.error:
            raise self.error
        return self.text


class FakeFlightProvider(FlightApiProvider):
    name = "fake"

    def __init__(self, journeys=None, configured=True, error=None):
        self.journeys = [BA117_JOURNEY] if journeys is None else journeys
        self.configured = configured
        self.error = error
        self.searches = []

    def is_configured(self) -> bool:
        return self.configured

    def search(self, origin_codes, destination_codes, departure_date):
        self.searches.append((origin_codes, destination_codes, departure_date))
        if self.error:
            raise FlightProviderError(self.error)
        return self.journeys


class FakeFlightNumberProvider(FlightNumberProvider):
    name = "fake-number"

    def __init__(self, journeys=None, configured=True, error=None):
        self.journeys = [KL1000_JOURNEY] if journeys is None else journeys
        self.configured = configured
        self.error = error
        self.lookups = []

    def is_configured(self) -> bool:
        return self.configured

    def lookup(self, airline, flight_number, departure_date):
        self.lookups.append((airline, flight_number, departure_date))
        if self.error:
            raise FlightProviderError(self.error)
        return self.journeys


class FakeRateProvider(RateProvider):
    """Answers every pair with one rate; set ``published_on`` to mimic a weekend."""

    def __init__(self, rate="0.85", published_on=None, latest=None, down=False):
        self.rate = Decimal(rate)
        self.published_on = published_on
        self.latest = latest or {"GBP": Decimal(1), "EUR": Decimal("1.17")}
        self.down = down
        self.lookups = []
        self.latest_requests = []

    def get_rate(self, base, quote, on):
        self.lookups.append((base, quote, on))
        if self.down:
            raise FxUnavailableError
        return PublishedRate(on=self.published_on or on, rate=self.rate)

    def get_latest(self, base):
        self.latest_requests.append(base)
        if self.down:
            raise FxUnavailableError
        return self.latest

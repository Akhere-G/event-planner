from datetime import UTC, datetime

from src.exceptions import FlightProviderError
from src.services.flight_providers import FlightApiProvider, FlightOffer

BA117 = FlightOffer(
    airline="BA",
    flight_number="117",
    departure_airport="LHR",
    arrival_airport="JFK",
    departure_timezone="Europe/London",
    arrival_timezone="America/New_York",
    depart_at=datetime(2026, 8, 1, 10, tzinfo=UTC),
    arrive_at=datetime(2026, 8, 1, 18, tzinfo=UTC),
    duration_minutes=480,
    price=520,
)


class FakeFlightProvider(FlightApiProvider):
    name = "fake"

    def __init__(self, offers=None, configured=True, error=None):
        self.offers = [BA117] if offers is None else offers
        self.configured = configured
        self.error = error
        self.searches = []

    def is_configured(self) -> bool:
        return self.configured

    def search(self, origin_codes, destination_codes, departure_date):
        self.searches.append((origin_codes, destination_codes, departure_date))
        if self.error:
            raise FlightProviderError(self.error)
        return self.offers

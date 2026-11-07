from datetime import UTC, date, datetime

import pytest
import requests
from src.exceptions import FlightProviderError
from src.services.flight_providers import FlightProviderFactory, SerpApiFlightProvider
from tests.fakes import FakeFlightProvider

SERPAPI_RESPONSE = {
    "search_metadata": {"google_flights_url": "https://www.google.com/travel/flights?q=x"},
    "best_flights": [
        {
            "flights": [
                {
                    "departure_airport": {"id": "LHR", "time": "2026-08-01 08:00"},
                    "arrival_airport": {"id": "JFK", "time": "2026-08-01 11:00"},
                    "duration": 480,
                    "flight_number": "BA 117",
                    "airline_logo": "https://logo/ba.png",
                    "travel_class": "Economy",
                    "extensions": [
                        "Average legroom (31 in)",
                        "Carbon emissions estimate: 292 kg",
                    ],
                }
            ],
            "extensions": [
                "1 carry-on bag included",
                "Checked baggage for a fee",
                "Full refund for cancellations",
            ],
            "price": 520,
        },
        {
            "flights": [
                {
                    "flight_number": "AA 1",
                    "departure_airport": {},
                    "arrival_airport": {},
                },
                {
                    "flight_number": "AA 2",
                    "departure_airport": {},
                    "arrival_airport": {},
                },
            ],
            "price": 300,
        },
    ]
}


class FakeResponse:
    def __init__(self, payload, status=200):
        self.payload = payload
        self.status = status

    def raise_for_status(self):
        if self.status >= 400:
            raise requests.HTTPError(str(self.status))

    def json(self):
        return self.payload


def search(provider=None):
    provider = provider or SerpApiFlightProvider(api_key="key")
    return provider.search(["LHR", "LGW"], ["JFK"], date(2026, 8, 1))


def test_serpapi_maps_nonstop_offers_to_utc(monkeypatch):
    calls = []

    def fake_get(url, params, timeout):
        calls.append(params)
        return FakeResponse(SERPAPI_RESPONSE)

    monkeypatch.setattr(requests, "get", fake_get)

    [offer] = search()

    assert offer.airline == "BA"
    assert offer.flight_number == "117"
    assert offer.depart_at == datetime(2026, 8, 1, 7, 0, tzinfo=UTC)
    assert offer.arrive_at == datetime(2026, 8, 1, 15, 0, tzinfo=UTC)
    assert offer.departure_timezone == "Europe/London"
    assert offer.arrival_timezone == "America/New_York"
    assert offer.price_gbp == 520
    assert offer.departure_airport_name == "London Heathrow Airport"
    assert offer.departure_city == "London"
    assert offer.arrival_city == "New York"
    assert offer.travel_class == "Economy"
    assert offer.extras == ("Average legroom (31 in)", "Carbon emissions estimate: 292 kg")
    assert offer.luggage == ("1 carry-on bag included", "Checked baggage for a fee")
    assert offer.purchase_url == "https://www.google.com/travel/flights?q=x"
    assert offer.airline_logo == "https://logo/ba.png"
    assert calls[0]["departure_id"] == "LHR,LGW"
    assert calls[0]["arrival_id"] == "JFK"
    assert calls[0]["stops"] == 1
    assert calls[0]["type"] == 2
    assert calls[0]["currency"] == "GBP"


def test_serpapi_missing_optional_details_default_to_empty(monkeypatch):
    payload = {
        "best_flights": [
            {
                "flights": [
                    {
                        "departure_airport": {"id": "LHR", "time": "2026-08-01 08:00"},
                        "arrival_airport": {"id": "JFK", "time": "2026-08-01 11:00"},
                        "duration": 480,
                        "flight_number": "BA 117",
                    }
                ]
            }
        ]
    }
    monkeypatch.setattr(requests, "get", lambda *a, **kw: FakeResponse(payload))

    [offer] = search()

    assert offer.price_gbp is None
    assert offer.travel_class is None
    assert offer.luggage == ()
    assert offer.extras == ()
    assert offer.purchase_url is None


def test_serpapi_no_results_is_empty(monkeypatch):
    error = {"error": "Google Flights hasn't returned any results for this query."}
    monkeypatch.setattr(requests, "get", lambda *a, **kw: FakeResponse(error))
    assert search() == []


@pytest.mark.parametrize(
    "response",
    [
        FakeResponse({"error": "Invalid API key."}),
        FakeResponse({}, status=500),
        FakeResponse({"best_flights": [{"flights": [{}]}]}),
    ],
)
def test_serpapi_failures_raise_provider_error(monkeypatch, response):
    monkeypatch.setattr(requests, "get", lambda *a, **kw: response)
    with pytest.raises(FlightProviderError):
        search()


def test_serpapi_request_exception_raises_provider_error(monkeypatch):
    def boom(*args, **kwargs):
        raise requests.ConnectionError()

    monkeypatch.setattr(requests, "get", boom)
    with pytest.raises(FlightProviderError):
        search()


def test_serpapi_is_configured_only_with_key(monkeypatch):
    monkeypatch.delenv("SERPAPI_API_KEY", raising=False)
    assert not SerpApiFlightProvider().is_configured()
    assert SerpApiFlightProvider(api_key="key").is_configured()


def test_factory_skips_unconfigured_providers(monkeypatch):
    configured = FakeFlightProvider()
    unconfigured = FakeFlightProvider(configured=False)
    monkeypatch.setattr(
        FlightProviderFactory, "PROVIDERS", [lambda: unconfigured, lambda: configured]
    )
    assert FlightProviderFactory.create_all() == [configured]

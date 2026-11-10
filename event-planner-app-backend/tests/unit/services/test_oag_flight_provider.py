from datetime import UTC, date, datetime

import pytest
import requests
from src.exceptions import FlightProviderError
from src.services.flight_providers import OagFlightProvider

OAG_RESPONSE = {
    "data": [
        {
            "carrier": {"iata": "KL", "icao": "KLM"},
            "serviceSuffix": "",
            "flightNumber": 1000,
            "sequenceNumber": 2,
            "departure": {
                "airport": {"iata": "AMS"},
                "date": {"local": "2026-08-01", "utc": "2026-08-01"},
                "time": {"local": "11:30", "utc": "09:30"},
            },
            "arrival": {
                "airport": {"iata": "JFK"},
                "date": {"local": "2026-08-01", "utc": "2026-08-01"},
                "time": {"local": "13:30", "utc": "17:30"},
            },
        },
        {
            "carrier": {"iata": "KL", "icao": "KLM"},
            "serviceSuffix": "",
            "flightNumber": 1000,
            "sequenceNumber": 1,
            "departure": {
                "airport": {"iata": "LHR"},
                "date": {"local": "2026-08-01", "utc": "2026-08-01"},
                "time": {"local": "08:00", "utc": "07:00"},
            },
            "arrival": {
                "airport": {"iata": "AMS"},
                "date": {"local": "2026-08-01", "utc": "2026-08-01"},
                "time": {"local": "10:15", "utc": "08:15"},
            },
        },
    ],
    "paging": {"limit": 10, "totalCount": 2, "totalPages": 1},
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


def lookup(flight_number="1000", provider=None):
    provider = provider or OagFlightProvider(api_key="key")
    return provider.lookup("KL", flight_number, date(2026, 8, 1))


def test_oag_maps_the_legs_of_a_flight_number_in_order(monkeypatch):
    calls = []

    def fake_get(url, params, headers, timeout):
        calls.append((url, params, headers))
        return FakeResponse(OAG_RESPONSE)

    monkeypatch.setattr(requests, "get", fake_get)

    [journey] = lookup()

    assert journey.leg_codes == (("KL", "1000"), ("KL", "1000"))
    first, second = journey.legs
    assert (first.departure_airport, first.arrival_airport) == ("LHR", "AMS")
    assert (second.departure_airport, second.arrival_airport) == ("AMS", "JFK")
    assert first.depart_at == datetime(2026, 8, 1, 7, 0, tzinfo=UTC)
    assert first.arrive_at == datetime(2026, 8, 1, 8, 15, tzinfo=UTC)
    assert first.duration_minutes == 75
    assert first.departure_timezone == "Europe/London"
    assert second.arrival_timezone == "America/New_York"
    assert first.departure_city == "London"
    assert first.arrival_airport_name == "Amsterdam Airport Schiphol"
    assert journey.price_gbp is None
    assert journey.stops == 1
    assert journey.total_duration_minutes == 630

    [(url, params, headers)] = calls
    assert url == "https://api.oag.com/flight-instances/"
    assert params["CarrierCode"] == "KL"
    assert params["FlightNumber"] == "1000"
    assert params["DepartureDateTime"] == "2026-08-01"
    assert params["CodeType"] == "IATA"
    assert params["version"] == "v2"
    assert headers == {"Subscription-Key": "key"}


def test_oag_sends_only_the_digits_of_the_flight_number(monkeypatch):
    sent = []

    def fake_get(url, params, headers, timeout):
        sent.append(params["FlightNumber"])
        return FakeResponse({"data": []})

    monkeypatch.setattr(requests, "get", fake_get)

    lookup("1000A")

    assert sent == ["1000"]


def test_oag_keeps_only_legs_with_the_requested_suffix(monkeypatch):
    suffixed = {**OAG_RESPONSE["data"][1], "serviceSuffix": "A"}
    monkeypatch.setattr(
        requests, "get", lambda *a, **kw: FakeResponse({"data": [suffixed]})
    )

    assert lookup("1000") == []
    [journey] = lookup("1000A")
    assert journey.first_leg.flight_number == "1000A"


def test_oag_no_flights_is_empty(monkeypatch):
    monkeypatch.setattr(requests, "get", lambda *a, **kw: FakeResponse({"data": []}))

    assert lookup() == []


@pytest.mark.parametrize(
    "response",
    [
        FakeResponse({}, status=500),
        FakeResponse({"title": "Unauthorized"}, status=401),
        FakeResponse({"unexpected": []}),
        FakeResponse({"data": [{"carrier": {"iata": "KL"}}]}),
    ],
)
def test_oag_failures_raise_provider_error(monkeypatch, response):
    monkeypatch.setattr(requests, "get", lambda *a, **kw: response)

    with pytest.raises(FlightProviderError):
        lookup()


def test_oag_request_exception_raises_provider_error(monkeypatch):
    def boom(*args, **kwargs):
        raise requests.ConnectionError()

    monkeypatch.setattr(requests, "get", boom)

    with pytest.raises(FlightProviderError):
        lookup()


def test_oag_is_configured_only_with_key(monkeypatch):
    monkeypatch.delenv("OAG_API_KEY", raising=False)
    assert not OagFlightProvider().is_configured()
    assert OagFlightProvider(api_key="key").is_configured()

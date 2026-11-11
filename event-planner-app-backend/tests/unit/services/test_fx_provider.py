from datetime import date
from decimal import Decimal

import pytest
import requests
from src.exceptions import FxUnavailableError
from src.services import fx_provider
from src.services.fx_provider import FrankfurterProvider


class FakeResponse:
    def __init__(self, payload, status=200):
        self.payload = payload
        self.status = status

    def raise_for_status(self):
        if self.status >= 400:
            raise requests.HTTPError(str(self.status))

    def json(self):
        if isinstance(self.payload, Exception):
            raise self.payload
        return self.payload


@pytest.fixture
def respond(monkeypatch):
    requests_made = []

    def install(payload=None, status=200, error=None):
        def fake_get(url, params=None, timeout=None):
            requests_made.append((url, params))
            if error:
                raise error
            return FakeResponse(payload, status)

        monkeypatch.setattr(fx_provider.requests, "get", fake_get)
        return requests_made

    return install


def test_rate_for_a_date_comes_from_the_ecb_feed(respond):
    made = respond(
        {"date": "2026-11-06", "base": "EUR", "quote": "GBP", "rate": 0.83415}
    )
    published = FrankfurterProvider().get_rate("EUR", "GBP", date(2026, 11, 7))
    assert published.on == date(2026, 11, 6)
    assert published.rate == Decimal("0.83415")
    url, params = made[0]
    assert url.endswith("/v2/rate/EUR/GBP")
    assert params == {"date": "2026-11-07", "providers": "ecb"}


def test_latest_rates_keep_supported_currencies_and_add_the_base(respond):
    respond(
        [
            {"date": "2026-11-10", "base": "GBP", "quote": "EUR", "rate": 1.17},
            {"date": "2026-11-10", "base": "GBP", "quote": "USD", "rate": 1.3},
            {"date": "2026-11-10", "base": "GBP", "quote": "XXX", "rate": 9},
        ]
    )
    rates = FrankfurterProvider().get_latest("GBP")
    assert rates == {
        "GBP": Decimal(1),
        "EUR": Decimal("1.17"),
        "USD": Decimal("1.3"),
    }


@pytest.mark.parametrize(
    "kwargs",
    [
        {"error": requests.ConnectionError("down")},
        {"error": requests.Timeout("slow")},
        {"payload": {}, "status": 404},
        {"payload": ValueError("not json")},
        {"payload": {"nope": 1}},
        {"payload": {"date": "2026-11-06", "rate": "abc"}},
    ],
)
def test_a_failed_or_odd_answer_is_unavailable(respond, kwargs):
    respond(**kwargs)
    with pytest.raises(FxUnavailableError):
        FrankfurterProvider().get_rate("EUR", "GBP", date(2026, 11, 6))


def test_latest_with_a_malformed_row_is_unavailable(respond):
    respond([{"quote": "EUR"}])
    with pytest.raises(FxUnavailableError):
        FrankfurterProvider().get_latest("GBP")

from datetime import date, timedelta
from decimal import Decimal

import pytest
import requests
from sqlalchemy import delete, select

from src.exceptions import BadRequestError, FxUnavailableError
from src.extensions import db
from src.models import ExchangeRate
from src.services import fx_service


def _rows():
    return db.session.execute(select(ExchangeRate)).scalars().all()


class FakeResponse:
    def __init__(self, body, status=200):
        self._body, self.status = body, status

    def raise_for_status(self):
        if self.status >= 400:
            raise requests.HTTPError(str(self.status))

    def json(self):
        return self._body


class Calls(list):
    def install(self, body=None, error=None, status=200):
        raise NotImplementedError


@pytest.fixture(autouse=True)
def clean_rates(app):
    # get_rate commits, which outlives the per-test rollback.
    db.session.execute(delete(ExchangeRate))
    db.session.commit()
    yield
    db.session.execute(delete(ExchangeRate))
    db.session.commit()


@pytest.fixture
def calls(monkeypatch):
    recorded = Calls()

    def install(body=None, error=None, status=200):
        def fake_get(url, params=None, timeout=None):
            recorded.append((url, params))
            if error:
                raise error
            return FakeResponse(body, status)

        monkeypatch.setattr(fx_service.requests, "get", fake_get)

    recorded.install = install
    fx_service.clear_latest_cache()
    return recorded


def test_same_currency_needs_no_request(app, calls):
    calls.install(error=AssertionError("no request expected"))
    assert fx_service.get_rate("GBP", "GBP", date(2026, 8, 1)) == Decimal("1")


def test_rate_fetched_and_cached(app, calls):
    calls.install({"date": "2026-08-03", "rates": {"GBP": 0.85}})
    on = date(2026, 8, 3)
    assert fx_service.get_rate("EUR", "GBP", on) == Decimal("0.85")
    assert fx_service.get_rate("eur", "gbp", on) == Decimal("0.85")
    assert len(calls) == 1
    assert len(_rows()) == 1


def test_weekend_falls_back_to_previous_business_day(app, calls):
    saturday = date(2026, 8, 1)
    assert saturday.weekday() == 5
    calls.install({"date": "2026-07-31", "rates": {"GBP": 0.8}})
    assert fx_service.get_rate("USD", "GBP", saturday) == Decimal("0.8")
    rows = {r.date for r in _rows()}
    assert rows == {saturday, date(2026, 7, 31)}
    # Both the weekend and the business day now come from the cache.
    fx_service.get_rate("USD", "GBP", date(2026, 7, 31))
    assert len(calls) == 1


def test_future_date_uses_today(app, calls):
    calls.install({"date": date.today().isoformat(), "rates": {"GBP": 0.9}})
    fx_service.get_rate("CAD", "GBP", date.today() + timedelta(days=30))
    assert calls[0][0].endswith(date.today().isoformat())


@pytest.mark.parametrize(
    "kwargs",
    [
        {"error": requests.ConnectionError("down")},
        {"error": requests.Timeout("slow")},
        {"body": {}, "status": 500},
        {"body": {"rates": {}, "date": "2026-08-03"}},
        {"body": {"nope": 1}},
    ],
)
def test_outage_raises_and_stores_nothing(app, calls, kwargs):
    calls.install(**kwargs)
    with pytest.raises(FxUnavailableError):
        fx_service.get_rate("EUR", "GBP", date(2026, 8, 3))
    assert len(_rows()) == 0


def test_unsupported_currency(app):
    with pytest.raises(BadRequestError):
        fx_service.get_rate("XXX", "GBP", date(2026, 8, 3))


def test_latest_rates_cached_and_stale_on_outage(app, calls):
    calls.install({"rates": {"EUR": 1.17, "USD": 1.3, "ZZZ": 5}})
    rates = fx_service.get_latest_rates("GBP")
    assert rates == {"EUR": Decimal("1.17"), "USD": Decimal("1.3"), "GBP": Decimal("1")}
    fx_service.get_latest_rates("GBP")
    assert len(calls) == 1
    # expire the cache, then take the API down: the stale copy is served
    ts, cached = fx_service._latest_cache["GBP"]
    fx_service._latest_cache["GBP"] = (ts - fx_service.LATEST_TTL_SECONDS - 1, cached)
    calls.install(error=requests.ConnectionError("down"))
    assert fx_service.get_latest_rates("GBP") == cached


def test_latest_rates_outage_without_cache(app, calls):
    calls.install(error=requests.ConnectionError("down"))
    with pytest.raises(FxUnavailableError):
        fx_service.get_latest_rates("GBP")

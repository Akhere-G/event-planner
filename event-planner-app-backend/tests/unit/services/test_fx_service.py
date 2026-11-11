from datetime import date, timedelta
from decimal import Decimal

import pytest
from sqlalchemy import select
from src.exceptions import FxUnavailableError
from src.extensions import db
from src.models import ExchangeRate
from src.services import fx_service


def cached_dates():
    stmt = select(ExchangeRate.date)
    return set(db.session.execute(stmt).scalars().all())


def test_same_currency_needs_no_lookup(rate_provider):
    assert fx_service.get_rate("GBP", "GBP", date(2026, 8, 1)) == Decimal(1)
    assert rate_provider.lookups == []


def test_a_fetched_rate_is_cached(rate_provider):
    on = date(2026, 8, 3)
    assert fx_service.get_rate("EUR", "GBP", on) == Decimal("0.85")
    assert fx_service.get_rate("EUR", "GBP", on) == Decimal("0.85")
    assert len(rate_provider.lookups) == 1
    assert cached_dates() == {on}


def test_a_weekend_uses_the_friday_rate_and_caches_both_days(rate_provider):
    saturday, friday = date(2026, 8, 1), date(2026, 7, 31)
    rate_provider.published_on = friday
    assert fx_service.get_rate("USD", "GBP", saturday) == Decimal("0.85")
    assert cached_dates() == {saturday, friday}
    fx_service.get_rate("USD", "GBP", friday)
    assert len(rate_provider.lookups) == 1


def test_today_is_not_cached_until_the_day_s_rate_is_published(rate_provider):
    today = date.today()
    yesterday = today - timedelta(days=1)
    rate_provider.published_on = yesterday
    fx_service.get_rate("EUR", "GBP", today)
    assert cached_dates() == {yesterday}
    fx_service.get_rate("EUR", "GBP", today)
    assert len(rate_provider.lookups) == 2

    rate_provider.published_on = None
    fx_service.get_rate("EUR", "GBP", today)
    assert cached_dates() == {yesterday, today}


def test_a_future_date_uses_today(rate_provider):
    fx_service.get_rate("CAD", "GBP", date.today() + timedelta(days=30))
    assert rate_provider.lookups[0][2] == date.today()


def test_an_outage_raises_and_stores_nothing(rate_provider):
    rate_provider.down = True
    with pytest.raises(FxUnavailableError):
        fx_service.get_rate("EUR", "GBP", date(2026, 8, 3))
    assert cached_dates() == set()


def test_losing_a_race_to_another_request_is_harmless(rate_provider, monkeypatch):
    on = date(2026, 8, 3)
    db.session.add(ExchangeRate(date=on, base="EUR", quote="GBP", rate=Decimal("0.9")))
    db.session.flush()
    monkeypatch.setattr(fx_service, "_cached_rate", lambda *args: None)

    assert fx_service.get_rate("EUR", "GBP", on) == Decimal("0.85")
    assert cached_dates() == {on}


def test_latest_rates_are_cached(rate_provider):
    first = fx_service.get_latest_rates("GBP")
    assert first["EUR"] == Decimal("1.17")
    fx_service.get_latest_rates("GBP")
    assert rate_provider.latest_requests == ["GBP"]


def test_stale_latest_rates_are_served_during_an_outage(rate_provider, monkeypatch):
    fx_service.get_latest_rates("GBP")
    later = fx_service.utcnow() + fx_service.LATEST_FRESH_FOR + timedelta(minutes=1)
    monkeypatch.setattr(fx_service, "utcnow", lambda: later)
    rate_provider.down = True

    assert fx_service.get_latest_rates("GBP")["EUR"] == Decimal("1.17")


def test_expired_latest_rates_are_refreshed(rate_provider, monkeypatch):
    fx_service.get_latest_rates("GBP")
    later = fx_service.utcnow() + fx_service.LATEST_FRESH_FOR + timedelta(minutes=1)
    monkeypatch.setattr(fx_service, "utcnow", lambda: later)
    rate_provider.latest = {"GBP": Decimal(1), "EUR": Decimal("1.2")}

    assert fx_service.get_latest_rates("GBP")["EUR"] == Decimal("1.2")


def test_an_outage_with_no_cached_copy_raises(rate_provider):
    rate_provider.down = True
    with pytest.raises(FxUnavailableError):
        fx_service.get_latest_rates("GBP")

from datetime import timedelta
from decimal import Decimal

import pytest
from src.services import fx_service


def test_rates_default_to_gbp_and_can_be_cached_by_the_browser(
    auth_client, rate_provider
):
    res = auth_client.get("/api/fx/rates")

    assert res.status_code == 200
    assert res.get_json()["data"] == {"base": "GBP", "rates": {"GBP": 1, "EUR": 1.17}}
    assert res.headers["Cache-Control"] == "private, max-age=86400"
    assert rate_provider.latest_requests == ["GBP"]


def test_rates_can_use_another_base(auth_client, rate_provider):
    auth_client.get("/api/fx/rates?base=USD")
    assert rate_provider.latest_requests == ["USD"]


@pytest.mark.parametrize("base", ["XXX", "BGN", "gbp"])
def test_an_unsupported_base_is_rejected(auth_client, rate_provider, base):
    assert auth_client.get(f"/api/fx/rates?base={base}").status_code == 400


def test_stale_rates_are_served_during_an_outage(
    auth_client, rate_provider, monkeypatch
):
    auth_client.get("/api/fx/rates")
    later = fx_service.utcnow() + fx_service.LATEST_FRESH_FOR + timedelta(hours=1)
    monkeypatch.setattr(fx_service, "utcnow", lambda: later)
    rate_provider.down = True

    res = auth_client.get("/api/fx/rates")

    assert res.status_code == 200
    assert res.get_json()["data"]["rates"]["EUR"] == float(Decimal("1.17"))


def test_an_outage_with_nothing_cached_is_503(auth_client, rate_provider):
    rate_provider.down = True
    assert auth_client.get("/api/fx/rates").status_code == 503


def test_rates_require_login(client, rate_provider):
    assert client.get("/api/fx/rates").status_code == 401

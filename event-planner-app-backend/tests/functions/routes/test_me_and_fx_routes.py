from decimal import Decimal

import pytest
import requests

from src.services import fx_service


def test_auth_check_includes_home_currency(auth_client, admin_user):
    res = auth_client.get("/api/auth/check")
    assert res.get_json()["data"]["homeCurrency"] == "GBP"


def test_patch_me_updates_home_currency(auth_client, admin_user):
    res = auth_client.patch("/api/users/me", json={"homeCurrency": "EUR"})
    assert res.status_code == 200
    assert res.get_json()["data"]["homeCurrency"] == "EUR"
    assert auth_client.get("/api/auth/check").get_json()["data"]["homeCurrency"] == "EUR"


@pytest.mark.parametrize("body", [{}, {"homeCurrency": "XXX"}, {"homeCurrency": 5}])
def test_patch_me_validates(auth_client, admin_user, body):
    assert auth_client.patch("/api/users/me", json=body).status_code == 400


def test_patch_me_requires_login(client):
    assert client.patch("/api/users/me", json={"homeCurrency": "EUR"}).status_code == 401


def test_fx_rates_route(auth_client, monkeypatch):
    fx_service.clear_latest_cache()
    monkeypatch.setattr(
        fx_service,
        "get_latest_rates",
        lambda base: {"EUR": Decimal("1.17"), "GBP": Decimal("1")},
    )
    res = auth_client.get("/api/fx/rates?base=GBP")
    assert res.status_code == 200
    assert res.get_json()["data"] == {"base": "GBP", "rates": {"EUR": 1.17, "GBP": 1}}
    assert "max-age=86400" in res.headers["Cache-Control"]


def test_fx_rates_outage_is_503(auth_client, monkeypatch):
    fx_service.clear_latest_cache()

    def boom(*a, **kw):
        raise requests.ConnectionError("down")

    monkeypatch.setattr(fx_service.requests, "get", boom)
    assert auth_client.get("/api/fx/rates").status_code == 503


def test_fx_rates_bad_base(auth_client):
    assert auth_client.get("/api/fx/rates?base=XXX").status_code == 400


def test_fx_rates_requires_login(client):
    assert client.get("/api/fx/rates").status_code == 401

from unittest.mock import MagicMock
from urllib.parse import parse_qs, urlparse

import pytest
import requests

from src.calendar_sync import oauth
from src.calendar_sync.connections import (
    forget_user,
    get_connection,
    read_refresh_token,
    save_refresh_token,
    synced_trip_ids,
)
from src.exceptions import BadRequestError, GoogleCalendarApiError
from src.extensions import db
from src.models import TripCalendar


def token_response(ok: bool, body: dict) -> MagicMock:
    response = MagicMock(ok=ok)
    response.json.return_value = body
    return response


def test_authorization_url_asks_for_offline_calendar_access():
    url = oauth.build_authorization_url("state-1")

    query = parse_qs(urlparse(url).query)
    assert query["client_id"] == ["client-id"]
    assert query["redirect_uri"] == ["https://app.example.com/callback"]
    assert query["scope"] == ["https://www.googleapis.com/auth/calendar.app.created"]
    assert query["access_type"] == ["offline"]
    assert query["prompt"] == ["consent"]
    assert query["state"] == ["state-1"]


def test_code_is_exchanged_for_a_refresh_token(monkeypatch):
    post = MagicMock(return_value=token_response(True, {"refresh_token": "refresh"}))
    monkeypatch.setattr(oauth.requests, "post", post)

    assert oauth.exchange_code_for_refresh_token("code-1") == "refresh"
    assert post.call_args.kwargs["data"]["code"] == "code-1"


@pytest.mark.parametrize(
    "response",
    [token_response(False, {}), token_response(True, {"access_token": "only"})],
)
def test_exchange_without_a_refresh_token_is_refused(monkeypatch, response):
    monkeypatch.setattr(oauth.requests, "post", MagicMock(return_value=response))

    with pytest.raises(GoogleCalendarApiError):
        oauth.exchange_code_for_refresh_token("code-1")


def test_exchange_reports_an_unreachable_google(monkeypatch):
    post = MagicMock(side_effect=requests.ConnectionError())
    monkeypatch.setattr(oauth.requests, "post", post)

    with pytest.raises(GoogleCalendarApiError):
        oauth.exchange_code_for_refresh_token("code-1")


def test_revoking_never_raises_when_google_is_unreachable(monkeypatch):
    post = MagicMock(side_effect=requests.ConnectionError())
    monkeypatch.setattr(oauth.requests, "post", post)

    oauth.revoke_token("refresh")


def test_the_refresh_token_is_stored_encrypted(app, admin_user):
    connection = save_refresh_token(admin_user.id, "refresh")

    assert connection.encrypted_refresh_token != "refresh"
    assert read_refresh_token(admin_user.id) == "refresh"


def test_saving_again_replaces_the_token(app, admin_user):
    save_refresh_token(admin_user.id, "first")
    save_refresh_token(admin_user.id, "second")

    assert read_refresh_token(admin_user.id) == "second"


def test_reading_without_a_connection_asks_to_connect(app, admin_user):
    with pytest.raises(BadRequestError):
        read_refresh_token(admin_user.id)


def test_forgetting_a_user_drops_the_token_and_their_trip_calendars(
    app, admin_user, itinerary
):
    save_refresh_token(admin_user.id, "refresh")
    db.session.add(
        TripCalendar(
            user_id=admin_user.id, itinerary_id=itinerary.id, google_calendar_id="cal"
        )
    )
    db.session.commit()
    assert synced_trip_ids(admin_user.id) == [itinerary.id]

    forget_user(admin_user.id)

    assert get_connection(admin_user.id) is None
    assert synced_trip_ids(admin_user.id) == []

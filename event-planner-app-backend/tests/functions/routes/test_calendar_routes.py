from urllib.parse import parse_qs, urlparse

import pytest

from src.calendar_sync.connections import get_connection, save_refresh_token
from src.calendar_sync.jobs.calendar_jobs import BootstrapCalendarJob, PullCalendarJob
from src.calendar_sync.watch import start_watch
from src.extensions import db
from src.models import TripCalendar
from src.routes import calendar_routes
from src.routes.calendar_routes import OAUTH_STATE_KEY
from tests.factories import make_trip_calendar
from tests.fakes import FakeCalendarClient

BASE = "/api/calendar/google"

pytestmark = pytest.mark.usefixtures("calendar_settings", "clean_calendar_tables")


@pytest.fixture
def google(monkeypatch):
    fake = FakeCalendarClient()
    monkeypatch.setattr(calendar_routes, "google_client_for_user", lambda _: fake)
    return fake


def test_status_requires_login(client):
    assert client.get(f"{BASE}/status").status_code == 401


def test_status_reports_the_connection_and_synced_trips(
    admin_client, admin_user, itinerary
):
    save_refresh_token(admin_user.id, "refresh")
    make_trip_calendar(admin_user, itinerary)

    data = admin_client.get(f"{BASE}/status").get_json()["data"]

    assert data == {"connected": True, "syncedTripIds": [itinerary.id]}


def test_status_for_a_user_who_has_not_connected(auth_client):
    data = auth_client.get(f"{BASE}/status").get_json()["data"]

    assert data == {"connected": False, "syncedTripIds": []}


def test_connect_returns_a_consent_link_bound_to_the_session(auth_client):
    response = auth_client.post(f"{BASE}/connect")

    url = response.get_json()["data"]["url"]
    state = parse_qs(urlparse(url).query)["state"][0]
    with auth_client.session_transaction() as session:
        assert session[OAUTH_STATE_KEY] == state


def test_the_callback_stores_the_token_and_returns_to_settings(
    auth_client, admin_user, monkeypatch
):
    monkeypatch.setattr(
        calendar_routes, "exchange_code_for_refresh_token", lambda code: f"rt-{code}"
    )
    with auth_client.session_transaction() as session:
        session[OAUTH_STATE_KEY] = "state-1"

    response = auth_client.get(f"{BASE}/callback?state=state-1&code=abc&scope=x")

    assert response.status_code == 302
    assert (
        response.location == "https://frontend.example.com/settings?calendar=connected"
    )
    assert get_connection(admin_user.id) is not None


@pytest.mark.parametrize(
    "query",
    ["state=wrong&code=abc", "state=state-1", "state=state-1&error=access_denied"],
)
def test_a_bad_or_denied_callback_returns_to_settings_as_failed(
    auth_client, admin_user, query
):
    with auth_client.session_transaction() as session:
        session[OAUTH_STATE_KEY] = "state-1"

    response = auth_client.get(f"{BASE}/callback?{query}")

    assert response.location.endswith("/settings?calendar=failed")
    assert get_connection(admin_user.id) is None


def test_the_callback_cannot_be_replayed(auth_client, monkeypatch):
    monkeypatch.setattr(
        calendar_routes, "exchange_code_for_refresh_token", lambda code: "rt"
    )
    with auth_client.session_transaction() as session:
        session[OAUTH_STATE_KEY] = "state-1"
    auth_client.get(f"{BASE}/callback?state=state-1&code=abc")

    response = auth_client.get(f"{BASE}/callback?state=state-1&code=abc")

    assert response.location.endswith("calendar=failed")


def test_disconnecting_forgets_the_account(
    auth_client, admin_user, google, monkeypatch
):
    monkeypatch.setattr("src.calendar_sync.disconnect.revoke_token", lambda _t: None)
    save_refresh_token(admin_user.id, "refresh")

    response = auth_client.delete(f"{BASE}/connection")

    assert response.status_code == 200
    assert get_connection(admin_user.id) is None


@pytest.mark.parametrize(
    "client_name", ["admin_client", "editor_client", "viewer_client"]
)
def test_every_member_can_switch_sync_on(
    request, client_name, itinerary, google, queued_jobs
):
    member_client = request.getfixturevalue(client_name)
    with member_client.session_transaction() as session:
        user_id = session["user_id"]
    save_refresh_token(user_id, "refresh")

    response = member_client.put(f"{BASE}/trips/{itinerary.id}")

    assert response.status_code == 200
    trip_calendar = db.session.query(TripCalendar).filter_by(user_id=user_id).one()
    assert queued_jobs.jobs == [BootstrapCalendarJob(trip_calendar.id)]


def test_switching_sync_on_requires_a_connection(admin_client, itinerary, queued_jobs):
    response = admin_client.put(f"{BASE}/trips/{itinerary.id}")

    assert response.status_code == 400
    assert queued_jobs.jobs == []


def test_switching_sync_on_is_refused_for_non_members(
    non_member_client, non_member_user, itinerary, google, queued_jobs
):
    save_refresh_token(non_member_user.id, "refresh")

    response = non_member_client.put(f"{BASE}/trips/{itinerary.id}")

    assert response.status_code == 401
    assert queued_jobs.jobs == []


def test_switching_sync_on_requires_login(client, itinerary):
    assert client.put(f"{BASE}/trips/{itinerary.id}").status_code == 401


def test_switching_sync_off_removes_the_trip_calendar(
    admin_client, admin_user, itinerary, google
):
    make_trip_calendar(admin_user, itinerary)

    response = admin_client.delete(f"{BASE}/trips/{itinerary.id}")

    assert response.status_code == 200
    assert db.session.query(TripCalendar).filter_by(user_id=admin_user.id).count() == 0


def watched_calendar(user, itinerary):
    trip_calendar = make_trip_calendar(user, itinerary)
    start_watch(trip_calendar, FakeCalendarClient())
    return trip_calendar


def test_a_notification_with_the_channel_token_queues_a_pull(
    client, admin_user, itinerary, queued_jobs
):
    trip_calendar = watched_calendar(admin_user, itinerary)

    response = client.post(
        f"{BASE}/webhook",
        headers={
            "X-Goog-Channel-ID": trip_calendar.channel_id,
            "X-Goog-Channel-Token": trip_calendar.channel_token,
            "X-Goog-Resource-State": "exists",
        },
    )

    assert response.status_code == 200
    assert queued_jobs.jobs == [PullCalendarJob(trip_calendar.id)]


def test_the_initial_sync_notification_queues_nothing(
    client, admin_user, itinerary, queued_jobs
):
    trip_calendar = watched_calendar(admin_user, itinerary)

    response = client.post(
        f"{BASE}/webhook",
        headers={
            "X-Goog-Channel-ID": trip_calendar.channel_id,
            "X-Goog-Channel-Token": trip_calendar.channel_token,
            "X-Goog-Resource-State": "sync",
        },
    )

    assert response.status_code == 200
    assert queued_jobs.jobs == []


@pytest.mark.parametrize("token", ["wrong", ""])
def test_a_notification_with_the_wrong_token_is_refused(
    client, admin_user, itinerary, queued_jobs, token
):
    trip_calendar = watched_calendar(admin_user, itinerary)

    response = client.post(
        f"{BASE}/webhook",
        headers={
            "X-Goog-Channel-ID": trip_calendar.channel_id,
            "X-Goog-Channel-Token": token,
            "X-Goog-Resource-State": "exists",
        },
    )

    assert response.status_code == 403
    assert queued_jobs.jobs == []


def test_a_notification_for_an_unknown_channel_is_refused(client, queued_jobs):
    response = client.post(f"{BASE}/webhook")

    assert response.status_code == 403
    assert queued_jobs.jobs == []

import pytest
from cryptography.fernet import Fernet

from src.calendar_sync.connections import (
    get_connection,
    read_refresh_token,
    save_refresh_token,
)
from src.extensions import db
from src.models import TripCalendar

from .fakes import FakeCalendarClient, make_trip_calendar

BASE = "/api/calendar/google"


@pytest.fixture(autouse=True)
def google_env(monkeypatch):
    values = {
        "GOOGLE_CALENDAR_CLIENT_ID": "client-id",
        "GOOGLE_CALENDAR_CLIENT_SECRET": "client-secret",
        "GOOGLE_CALENDAR_REDIRECT_URI": "https://app.test/api/calendar/google/callback",
        "GOOGLE_CALENDAR_WEBHOOK_URL": "https://app.test/api/calendar/google/webhook",
        "CALENDAR_TOKEN_ENCRYPTION_KEY": Fernet.generate_key().decode(),
    }
    for name, value in values.items():
        monkeypatch.setenv(name, value)


@pytest.fixture
def background(monkeypatch):
    """Captures work the routes queue instead of running it on a thread."""
    queued = []
    monkeypatch.setattr(
        "src.routes.calendar_routes.run_in_background",
        lambda task, *args: queued.append((task.__name__, args[0])),
    )
    monkeypatch.setattr(
        "src.calendar_sync.webhook.run_in_background",
        lambda task, *args: queued.append((task.__name__, args[0])),
    )
    return queued


@pytest.fixture
def fake_google(monkeypatch):
    client = FakeCalendarClient()
    monkeypatch.setattr(
        "src.routes.calendar_routes.google_client_for_user", lambda _user_id: client
    )
    return client


def start_oauth(client) -> str:
    response = client.post(f"{BASE}/connect")
    assert response.status_code == 200
    return response.get_json()["data"]["url"]


def test_connect_requires_login(client):
    assert client.post(f"{BASE}/connect").status_code == 401


def test_callback_stores_the_refresh_token_encrypted(
    auth_client, admin_user, monkeypatch
):
    monkeypatch.setattr(
        "src.routes.calendar_routes.exchange_code_for_refresh_token",
        lambda _code: "refresh-token",
    )
    start_oauth(auth_client)
    with auth_client.session_transaction() as session:
        state = session["calendar_oauth_state"]

    response = auth_client.get(f"{BASE}/callback?code=abc&state={state}")

    assert response.status_code == 302
    connection = get_connection(admin_user.id)
    assert connection.encrypted_refresh_token != "refresh-token"
    assert read_refresh_token(admin_user.id) == "refresh-token"


def test_callback_rejects_a_mismatched_state(auth_client, admin_user):
    start_oauth(auth_client)

    response = auth_client.get(f"{BASE}/callback?code=abc&state=forged")

    assert response.status_code == 400
    assert get_connection(admin_user.id) is None


def test_enabling_a_trip_requires_a_connected_account(
    viewer_client, itinerary, fake_google, background
):
    response = viewer_client.put(f"{BASE}/trips/{itinerary.id}")

    assert response.status_code == 400
    assert background == []


def test_any_member_can_enable_and_disable_trip_sync(
    viewer_client, viewer_user, itinerary, fake_google, background
):
    save_refresh_token(viewer_user.id, "refresh-token")

    enabled = viewer_client.put(f"{BASE}/trips/{itinerary.id}")
    assert enabled.status_code == 200
    assert background[0][0] == "bootstrap_trip_calendar"
    assert db.session.query(TripCalendar).filter_by(user_id=viewer_user.id).count() == 1

    disabled = viewer_client.delete(f"{BASE}/trips/{itinerary.id}")
    assert disabled.status_code == 200
    assert db.session.query(TripCalendar).filter_by(user_id=viewer_user.id).count() == 0


def test_non_members_cannot_toggle_trip_sync(auth_client, itinerary, fake_google):
    assert auth_client.put(f"{BASE}/trips/{itinerary.id}").status_code == 401


def test_webhook_rejects_an_unknown_channel_token(
    client, itinerary, admin_user, admin_itinerary_user, background
):
    trip_calendar = make_trip_calendar(admin_user, itinerary)
    trip_calendar.channel_id, trip_calendar.channel_token = "channel-1", "secret"
    db.session.flush()

    headers = {
        "X-Goog-Channel-ID": "channel-1",
        "X-Goog-Channel-Token": "wrong",
        "X-Goog-Resource-State": "exists",
    }

    assert client.post(f"{BASE}/webhook", headers=headers).status_code == 403
    assert background == []


def test_webhook_queues_a_pull_but_ignores_the_initial_sync_message(
    client, itinerary, admin_user, admin_itinerary_user, background
):
    trip_calendar = make_trip_calendar(admin_user, itinerary)
    trip_calendar.channel_id, trip_calendar.channel_token = "channel-1", "secret"
    db.session.flush()
    headers = {"X-Goog-Channel-ID": "channel-1", "X-Goog-Channel-Token": "secret"}

    client.post(f"{BASE}/webhook", headers={**headers, "X-Goog-Resource-State": "sync"})
    assert background == []

    client.post(
        f"{BASE}/webhook", headers={**headers, "X-Goog-Resource-State": "exists"}
    )
    assert background == [("pull_trip_calendar", trip_calendar.id)]

from datetime import UTC, datetime, timedelta

import pytest

from src.calendar_sync import disconnect as disconnect_module
from src.calendar_sync.client import GoogleAuthRevokedError
from src.calendar_sync.connections import get_connection, save_refresh_token
from src.calendar_sync.disconnect import disconnect_account
from src.calendar_sync.failures import handle_user_failure
from src.calendar_sync.members import member_role, trip_calendars_for_members
from src.calendar_sync.trip_sync import disable_trip_sync, enable_trip_sync
from src.calendar_sync.watch import (
    renew_expiring_channels,
    start_watch,
    stop_watch,
    trip_calendars_needing_channel,
)
from src.exceptions import BadRequestError
from src.extensions import db
from src.models import TripCalendar
from tests.factories import make_trip_calendar
from tests.fakes import FakeCalendarClient


@pytest.fixture
def fake_client():
    return FakeCalendarClient()


def test_enabling_creates_one_named_calendar_per_user_and_trip(
    app, admin_user, itinerary, fake_client
):
    save_refresh_token(admin_user.id, "refresh")

    first = enable_trip_sync(admin_user.id, itinerary, lambda _: fake_client)
    second = enable_trip_sync(admin_user.id, itinerary, lambda _: fake_client)

    assert first.id == second.id
    assert first.google_calendar_id == "cal-1"
    assert fake_client.calls == [("create_calendar", f"TripTrack: {itinerary.name}")]


def test_enabling_requires_a_connection(app, admin_user, itinerary, fake_client):
    with pytest.raises(BadRequestError):
        enable_trip_sync(admin_user.id, itinerary, lambda _: fake_client)


def test_disabling_stops_the_channel_and_forgets_the_calendar(
    app, admin_user, itinerary, fake_client
):
    trip_calendar = make_trip_calendar(admin_user, itinerary)
    start_watch(trip_calendar, fake_client)

    disable_trip_sync(admin_user.id, itinerary.id, lambda _: fake_client)

    assert db.session.get(TripCalendar, trip_calendar.id) is None
    assert [name for name, _ in fake_client.calls] == ["watch", "stop"]


def test_disabling_a_trip_that_is_not_synced_does_nothing(
    app, admin_user, itinerary, fake_client
):
    disable_trip_sync(admin_user.id, itinerary.id, lambda _: fake_client)

    assert fake_client.calls == []


def test_starting_a_watch_stores_the_channel_and_replaces_the_old_one(
    app, admin_user, itinerary, fake_client
):
    trip_calendar = make_trip_calendar(admin_user, itinerary)

    start_watch(trip_calendar, fake_client)
    first_channel = trip_calendar.channel_id
    start_watch(trip_calendar, fake_client)

    assert trip_calendar.channel_id != first_channel
    assert trip_calendar.channel_resource_id == "resource-1"
    assert trip_calendar.channel_token
    assert ("stop", first_channel) in fake_client.calls
    assert ("watch", "https://app.example.com/webhook") in fake_client.calls


def test_stopping_clears_the_channel(app, admin_user, itinerary, fake_client):
    trip_calendar = make_trip_calendar(admin_user, itinerary)
    start_watch(trip_calendar, fake_client)

    stop_watch(trip_calendar, fake_client)

    assert trip_calendar.channel_id is None
    assert trip_calendar.channel_expires_at is None


def test_channels_lapsing_soon_or_missing_are_renewed(
    app, admin_user, editor_user, itinerary, fake_client
):
    missing = make_trip_calendar(admin_user, itinerary)
    lapsing = make_trip_calendar(editor_user, itinerary)
    lapsing.channel_expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(
        hours=12
    )
    db.session.commit()

    assert {c.id for c in trip_calendars_needing_channel()} == {
        missing.id,
        lapsing.id,
    }
    assert renew_expiring_channels(lambda _: fake_client) == 2
    assert trip_calendars_needing_channel() == []


def test_renewal_failure_for_one_user_does_not_block_the_rest(
    app, admin_user, editor_user, itinerary, fake_client
):
    make_trip_calendar(admin_user, itinerary)
    ok = make_trip_calendar(editor_user, itinerary)
    db.session.commit()

    def client_for(user_id):
        if user_id == admin_user.id:
            raise RuntimeError("boom")
        return fake_client

    renew_expiring_channels(client_for)

    assert db.session.get(TripCalendar, ok.id).channel_id is not None


def test_a_revoked_grant_disconnects_the_user(app, admin_user, itinerary):
    save_refresh_token(admin_user.id, "refresh")
    trip_calendar = make_trip_calendar(admin_user, itinerary)

    handle_user_failure(admin_user.id, GoogleAuthRevokedError())

    assert get_connection(admin_user.id) is None
    assert db.session.get(TripCalendar, trip_calendar.id) is None


def test_other_failures_keep_the_connection(app, admin_user):
    save_refresh_token(admin_user.id, "refresh")

    handle_user_failure(admin_user.id, RuntimeError("boom"))

    assert get_connection(admin_user.id) is not None


def test_disconnecting_stops_channels_revokes_and_forgets(
    app, admin_user, itinerary, fake_client, monkeypatch
):
    revoked = []
    monkeypatch.setattr(disconnect_module, "revoke_token", revoked.append)
    save_refresh_token(admin_user.id, "refresh")
    trip_calendar = make_trip_calendar(admin_user, itinerary)
    start_watch(trip_calendar, fake_client)

    disconnect_account(admin_user.id, lambda _: fake_client)

    assert revoked == ["refresh"]
    assert get_connection(admin_user.id) is None
    assert db.session.get(TripCalendar, trip_calendar.id) is None
    assert [name for name, _ in fake_client.calls] == ["watch", "stop"]


def test_only_current_members_have_a_role_and_are_listed(
    app, admin_user, editor_user, viewer_user, itinerary, admin_itinerary_user
):
    owner = make_trip_calendar(admin_user, itinerary)
    gone = make_trip_calendar(viewer_user, itinerary)

    assert member_role(owner) == "admin"
    assert member_role(gone) is None
    assert trip_calendars_for_members(itinerary.id) == [owner]

from datetime import UTC, datetime, timedelta

import pytest

from src.calendar_sync.pull import pull_trip_calendar
from src.calendar_sync.push import push_changes
from src.extensions import db
from src.models import Event
from src.realtime.change_tracker import EntityChange
from tests.factories import EventFactory

from .fakes import FakeCalendarClient, make_trip_calendar


def google_event(event_id: str, updated: datetime, **fields) -> dict:
    return {
        "id": event_id,
        "etag": f'"from-google-{event_id}"',
        "updated": updated.isoformat(),
        "summary": "Edited in Google",
        "start": {"dateTime": "2026-08-20T14:00:00Z"},
        "end": {"dateTime": "2026-08-20T15:00:00Z"},
        **fields,
    }


def synced(user, itinerary):
    """An event already pushed for `user`, plus the fake Google behind it."""
    event = EventFactory(itinerary=itinerary, creator=user)
    trip_calendar = make_trip_calendar(user, itinerary)
    client = FakeCalendarClient()
    change = [EntityChange(itinerary.id, "event", event.id, False)]
    push_changes(change, lambda _user_id: client)
    return event, trip_calendar, client


@pytest.fixture
def editor_sync(itinerary, editor_user, editor_itinerary_user):
    return synced(editor_user, itinerary)


def pull(trip_calendar, client) -> None:
    pull_trip_calendar(trip_calendar.id, lambda _user_id: client)


def test_editor_receives_a_newer_google_edit(editor_sync):
    event, trip_calendar, client = editor_sync
    client.feed = [google_event("g1", datetime.now(UTC) + timedelta(hours=1))]

    pull(trip_calendar, client)

    assert event.name == "Edited in Google"
    assert event.start_at.hour == 14
    assert trip_calendar.sync_token == "next-token"


def test_viewer_never_receives_google_edits(
    itinerary, viewer_user, viewer_itinerary_user
):
    event, trip_calendar, client = synced(viewer_user, itinerary)
    original_name = event.name
    client.feed = [google_event("g1", datetime.now(UTC) + timedelta(hours=1))]

    pull(trip_calendar, client)

    assert event.name == original_name
    assert trip_calendar.sync_token == "next-token"


def test_later_edit_wins_when_the_app_changed_after_google(editor_sync):
    event, trip_calendar, client = editor_sync
    client.feed = [google_event("g1", datetime.now(UTC) - timedelta(hours=1))]

    pull(trip_calendar, client)

    assert event.name != "Edited in Google"


def test_our_own_push_echoing_back_is_ignored(editor_sync):
    event, trip_calendar, client = editor_sync
    echo = {**client.events["g1"], "summary": "Echo"}
    client.feed = [echo]

    pull(trip_calendar, client)

    assert event.name != "Echo"


def test_new_google_event_becomes_an_event_for_editors(editor_sync):
    _event, trip_calendar, client = editor_sync
    client.feed = [google_event("g99", datetime.now(UTC), summary="Brunch")]

    pull(trip_calendar, client)

    created = db.session.query(Event).filter_by(name="Brunch").one()
    assert created.updated_by_id == trip_calendar.user_id


def test_google_deletion_removes_the_event_for_editors(editor_sync):
    event, trip_calendar, client = editor_sync
    event_id = event.id
    client.feed = [{"id": "g1", "status": "cancelled"}]

    pull(trip_calendar, client)

    assert db.session.get(Event, event_id) is None

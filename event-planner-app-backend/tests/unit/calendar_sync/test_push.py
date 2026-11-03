import pytest

from src.calendar_sync.push import push_changes
from src.extensions import db
from src.models import CalendarLink
from src.realtime.change_tracker import EntityChange
from tests.factories import EventFactory

from .fakes import FakeCalendarClient, make_trip_calendar


@pytest.fixture
def client() -> FakeCalendarClient:
    return FakeCalendarClient()


@pytest.fixture
def event(itinerary, admin_user, admin_itinerary_user):
    event = EventFactory(itinerary=itinerary, creator=admin_user)
    make_trip_calendar(admin_user, itinerary)
    return event


def links_for(event) -> int:
    return db.session.query(CalendarLink).filter_by(entity_id=event.id).count()


def change(event, deleted: bool = False) -> list[EntityChange]:
    return [EntityChange(event.itinerary_id, "event", event.id, deleted)]


def test_new_event_is_inserted_then_later_edits_update_it(client, event):
    push_changes(change(event), lambda _user_id: client)
    event.name = "Renamed"
    db.session.flush()
    push_changes(change(event), lambda _user_id: client)

    assert [call[0] for call in client.calls] == ["insert", "update"]
    assert client.events["g1"]["summary"] == "Renamed"


def test_unchanged_event_is_not_pushed_twice(client, event):
    push_changes(change(event), lambda _user_id: client)
    push_changes(change(event), lambda _user_id: client)

    assert [call[0] for call in client.calls] == ["insert"]


def test_deleted_event_is_removed_from_google_and_unlinked(client, event):
    push_changes(change(event), lambda _user_id: client)
    push_changes(change(event, deleted=True), lambda _user_id: client)

    assert client.events == {}
    assert links_for(event) == 0


def test_viewers_receive_pushes_too(
    client, itinerary, viewer_user, viewer_itinerary_user, event
):
    make_trip_calendar(viewer_user, itinerary)

    push_changes(change(event), lambda _user_id: client)

    assert links_for(event) == 2

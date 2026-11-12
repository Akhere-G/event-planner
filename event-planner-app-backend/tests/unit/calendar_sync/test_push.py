import pytest

from src.calendar_sync.links import find_link
from src.calendar_sync.push import push_changes, push_trip
from src.extensions import db
from src.models import CalendarLink
from src.realtime import EntityChange
from tests.factories import make_trip_calendar
from tests.fakes import FakeCalendarClient


@pytest.fixture
def fake_client():
    return FakeCalendarClient()


@pytest.fixture
def trip_calendar(admin_user, itinerary, admin_itinerary_user):
    return make_trip_calendar(admin_user, itinerary)


def change(entity, obj, deleted=False):
    return EntityChange(obj.itinerary_id, entity, obj.id, deleted)


def kinds(client):
    return [name for name, _ in client.calls]


def test_a_new_event_is_inserted_and_linked(trip_calendar, event, fake_client):
    push_changes([change("event", event)], lambda _: fake_client)

    link = find_link(trip_calendar, "event", event.id)
    assert kinds(fake_client) == ["insert"]
    assert link.google_event_id in fake_client.events
    assert link.etag == fake_client.events[link.google_event_id]["etag"]


def test_a_flight_is_pushed_with_its_route(trip_calendar, flight, fake_client):
    push_changes([change("flight", flight)], lambda _: fake_client)

    [(_, summary)] = fake_client.calls
    assert "LHR → CDG" in summary


def test_an_edited_event_patches_the_existing_google_event(
    trip_calendar, event, fake_client
):
    push_changes([change("event", event)], lambda _: fake_client)
    event.name = "Renamed"
    db.session.flush()

    push_changes([change("event", event)], lambda _: fake_client)

    assert kinds(fake_client) == ["insert", "update"]
    link = find_link(trip_calendar, "event", event.id)
    assert fake_client.events[link.google_event_id]["summary"] == "Renamed"


def test_a_row_already_in_sync_is_not_pushed_again(trip_calendar, event, fake_client):
    push_changes([change("event", event)], lambda _: fake_client)

    push_changes([change("event", event)], lambda _: fake_client)

    assert kinds(fake_client) == ["insert"]


def test_an_event_deleted_in_google_is_inserted_again(
    trip_calendar, event, fake_client
):
    push_changes([change("event", event)], lambda _: fake_client)
    fake_client.events.clear()
    event.name = "Renamed"
    db.session.flush()

    push_changes([change("event", event)], lambda _: fake_client)

    assert kinds(fake_client) == ["insert", "update", "insert"]


def test_a_deleted_row_is_removed_from_google_and_unlinked(
    trip_calendar, event, fake_client
):
    push_changes([change("event", event)], lambda _: fake_client)
    event_id = event.id
    db.session.delete(event)
    db.session.flush()

    push_changes(
        [EntityChange(trip_calendar.itinerary_id, "event", event_id, True)],
        lambda _: fake_client,
    )

    assert kinds(fake_client) == ["insert", "delete"]
    assert fake_client.events == {}
    assert find_link(trip_calendar, "event", event_id) is None


def test_deleting_a_row_that_was_never_synced_does_nothing(trip_calendar, fake_client):
    push_changes(
        [EntityChange(trip_calendar.itinerary_id, "event", 999, True)],
        lambda _: fake_client,
    )

    assert fake_client.calls == []


def test_entities_without_a_mapper_are_ignored(trip_calendar, event, fake_client):
    push_changes(
        [EntityChange(event.itinerary_id, "expense", 1, False)], lambda _: fake_client
    )

    assert fake_client.calls == []


def test_every_member_including_viewers_gets_the_change(
    trip_calendar, event, itinerary, viewer_user, viewer_itinerary_user, fake_client
):
    make_trip_calendar(viewer_user, itinerary)

    push_changes([change("event", event)], lambda _: fake_client)

    assert kinds(fake_client) == ["insert", "insert"]
    assert db.session.query(CalendarLink).count() == 2


def test_someone_who_left_the_trip_stops_receiving_changes(
    trip_calendar, event, itinerary, viewer_user, fake_client
):
    make_trip_calendar(viewer_user, itinerary)

    push_changes([change("event", event)], lambda _: fake_client)

    assert kinds(fake_client) == ["insert"]


def test_a_failing_member_does_not_block_the_others(
    trip_calendar,
    event,
    itinerary,
    editor_user,
    editor_itinerary_user,
    fake_client,
):
    make_trip_calendar(editor_user, itinerary)
    db.session.commit()

    def client_for(user_id):
        if user_id == editor_user.id:
            raise RuntimeError("boom")
        return fake_client

    push_changes([change("event", event)], client_for)

    assert find_link(trip_calendar, "event", event.id) is not None


def test_switching_sync_on_pushes_every_event_and_flight(
    trip_calendar, event, flight, fake_client
):
    push_trip(trip_calendar, fake_client)

    assert kinds(fake_client) == ["insert", "insert"]
    assert find_link(trip_calendar, "flight", flight.id) is not None


def test_bringing_a_trip_in_line_removes_google_events_of_deleted_rows(
    trip_calendar, event, fake_client
):
    push_trip(trip_calendar, fake_client)
    event_id = event.id
    db.session.delete(event)
    db.session.flush()
    db.session.expire(trip_calendar, ["links"])

    push_trip(trip_calendar, fake_client)

    assert kinds(fake_client) == ["insert", "delete"]
    assert find_link(trip_calendar, "event", event_id) is None

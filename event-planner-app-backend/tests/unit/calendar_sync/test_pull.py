from datetime import UTC, datetime

import pytest

from src.calendar_sync.client import GoogleAuthRevokedError
from src.calendar_sync.connections import get_connection, save_refresh_token
from src.calendar_sync.links import find_link, find_link_by_google_event, record_sync
from src.calendar_sync.mappers.times import ensure_utc
from src.calendar_sync.pull import pull_trip_calendar
from src.extensions import db
from src.models import Event, Flight, TripCalendar
from tests.factories import make_trip_calendar
from tests.fakes import FakeCalendarClient

LATER = "2099-01-01T00:00:00Z"
EARLIER = "2000-01-01T00:00:00Z"


@pytest.fixture
def fake_client():
    return FakeCalendarClient()


@pytest.fixture
def trip_calendar(admin_user, itinerary, admin_itinerary_user):
    return make_trip_calendar(admin_user, itinerary)


def google_event(event_id="g1", etag="e-new", updated=LATER, **fields):
    return {
        "id": event_id,
        "etag": etag,
        "updated": updated,
        "summary": "From Google",
        "start": {"dateTime": "2026-08-02T10:00:00Z"},
        "end": {"dateTime": "2026-08-02T11:00:00Z"},
        **fields,
    }


def pull(trip_calendar, fake_client):
    pull_trip_calendar(trip_calendar.id, lambda _: fake_client)
    db.session.refresh(trip_calendar)


def link_to(trip_calendar, entity, obj, event_id="g1", etag="e-old"):
    return record_sync(trip_calendar, entity, obj, {"id": event_id, "etag": etag})


def test_a_later_google_edit_updates_the_event(trip_calendar, event, fake_client):
    link_to(trip_calendar, "event", event)
    fake_client.feed = [google_event(summary="Louvre")]

    pull(trip_calendar, fake_client)

    assert event.name == "Louvre"
    assert event.updated_by_id == trip_calendar.user_id
    assert ensure_utc(event.start_at) == datetime(2026, 8, 2, 10, 0, tzinfo=UTC)
    assert find_link(trip_calendar, "event", event.id).etag == "e-new"


def test_an_app_edit_newer_than_the_google_edit_wins(trip_calendar, event, fake_client):
    link_to(trip_calendar, "event", event)
    name = event.name
    fake_client.feed = [google_event(updated=EARLIER, summary="Stale")]

    pull(trip_calendar, fake_client)

    assert event.name == name


def test_our_own_push_coming_back_is_ignored(trip_calendar, event, fake_client):
    link_to(trip_calendar, "event", event, etag="same")
    name = event.name
    fake_client.feed = [google_event(etag="same", summary="Echo")]

    pull(trip_calendar, fake_client)

    assert event.name == name


def test_the_sync_token_advances(trip_calendar, fake_client):
    pull(trip_calendar, fake_client)

    assert trip_calendar.sync_token == "next-token"


def test_an_event_created_in_google_becomes_a_trip_event(
    trip_calendar, itinerary, fake_client
):
    fake_client.feed = [google_event(summary="Dinner from Google")]

    pull(trip_calendar, fake_client)

    created = db.session.query(Event).filter_by(name="Dinner from Google").one()
    assert created.itinerary_id == itinerary.id
    assert created.created_by_id == created.updated_by_id == trip_calendar.user_id
    assert find_link_by_google_event(trip_calendar, "g1").entity_id == created.id


def test_an_event_cancelled_in_google_is_deleted_from_the_trip(
    trip_calendar, event, fake_client
):
    event_id = event.id
    link_to(trip_calendar, "event", event)
    fake_client.feed = [{"id": "g1", "status": "cancelled"}]

    pull(trip_calendar, fake_client)

    assert db.session.get(Event, event_id) is None
    assert find_link(trip_calendar, "event", event_id) is None


def test_a_flight_cancelled_in_google_stays_and_is_unlinked(
    trip_calendar, flight, fake_client
):
    flight_id = flight.id
    link_to(trip_calendar, "flight", flight)
    fake_client.feed = [{"id": "g1", "status": "cancelled"}]

    pull(trip_calendar, fake_client)

    assert db.session.get(Flight, flight_id) is not None
    assert find_link(trip_calendar, "flight", flight_id) is None


def test_a_cancelled_event_we_never_linked_is_ignored(trip_calendar, fake_client):
    fake_client.feed = [{"id": "unknown", "status": "cancelled"}]

    pull(trip_calendar, fake_client)

    assert trip_calendar.sync_token == "next-token"


def test_google_only_reschedules_a_flight(trip_calendar, flight, fake_client):
    link_to(trip_calendar, "flight", flight)
    airline = flight.airline
    fake_client.feed = [
        google_event(
            summary="Renamed",
            start={"dateTime": "2026-08-01T10:00:00Z"},
            end={"dateTime": "2026-08-01T12:00:00Z"},
        )
    ]

    pull(trip_calendar, fake_client)

    assert flight.airline == airline
    assert ensure_utc(flight.depart_at) == datetime(2026, 8, 1, 10, 0, tzinfo=UTC)


def test_viewers_sync_one_way(
    viewer_user, itinerary, viewer_itinerary_user, event, fake_client
):
    viewer_calendar = make_trip_calendar(viewer_user, itinerary)
    link_to(viewer_calendar, "event", event)
    name = event.name
    fake_client.feed = [google_event(summary="Edit"), google_event("g2")]

    pull(viewer_calendar, fake_client)

    assert event.name == name
    assert db.session.query(Event).filter_by(name="From Google").count() == 0
    assert viewer_calendar.sync_token == "next-token"


def test_editors_apply_google_changes(
    editor_user, itinerary, editor_itinerary_user, event, fake_client
):
    editor_calendar = make_trip_calendar(editor_user, itinerary)
    link_to(editor_calendar, "event", event)
    fake_client.feed = [google_event(summary="Editor edit")]

    pull(editor_calendar, fake_client)

    assert event.name == "Editor edit"


def test_someone_who_left_the_trip_is_not_synced(viewer_user, itinerary, fake_client):
    left = make_trip_calendar(viewer_user, itinerary)
    fake_client.feed = [google_event()]

    pull(left, fake_client)

    assert fake_client.calls == []


def test_an_expired_sync_token_triggers_a_full_sync(trip_calendar, fake_client):
    trip_calendar.sync_token = "stale"
    fake_client.sync_token_expired = True

    pull(trip_calendar, fake_client)

    assert fake_client.calls == [("list", "stale"), ("list", None)]
    assert trip_calendar.sync_token == "next-token"


def test_one_bad_google_event_does_not_block_the_rest(trip_calendar, fake_client):
    fake_client.feed = [
        {"id": "broken", "etag": "x", "updated": LATER},
        google_event("g2", summary="Fine"),
    ]

    pull(trip_calendar, fake_client)

    assert db.session.query(Event).filter_by(name="Fine").count() == 1


def test_revoked_access_disconnects_the_user(trip_calendar, fake_client):
    save_refresh_token(trip_calendar.user_id, "refresh")
    user_id = trip_calendar.user_id
    trip_calendar_id = trip_calendar.id

    def client_for(_user_id):
        raise GoogleAuthRevokedError()

    pull_trip_calendar(trip_calendar_id, client_for)

    assert get_connection(user_id) is None
    assert db.session.get(TripCalendar, trip_calendar_id) is None

import pytest
from src.calendar_sync.bootstrap import bootstrap_trip_calendar
from src.calendar_sync.links import find_link
from src.calendar_sync.reconcile import reconcile_trip_calendar
from src.extensions import db
from src.models import Event

from .fakes import FakeCalendarClient, make_trip_calendar

LATER = "2099-01-01T00:00:00Z"


@pytest.fixture
def fake_client():
    return FakeCalendarClient()


@pytest.fixture
def trip_calendar(admin_user, itinerary, admin_itinerary_user):
    calendar = make_trip_calendar(admin_user, itinerary)
    db.session.commit()
    return calendar


def kinds(client):
    return [name for name, _ in client.calls]


def test_bootstrap_pushes_everything_then_pulls_then_watches(
    trip_calendar, event, flight, fake_client
):
    bootstrap_trip_calendar(trip_calendar.id, lambda _: fake_client)

    assert kinds(fake_client) == ["insert", "insert", "list", "watch"]
    assert find_link(trip_calendar, "event", event.id) is not None
    assert find_link(trip_calendar, "flight", flight.id) is not None
    assert trip_calendar.sync_token == "next-token"
    assert trip_calendar.channel_id is not None


def test_bootstrapping_a_calendar_that_was_removed_does_nothing(fake_client):
    bootstrap_trip_calendar(999, lambda _: fake_client)

    assert fake_client.calls == []


def test_a_failing_bootstrap_is_contained(trip_calendar, event):
    def client_for(_user_id):
        raise RuntimeError("boom")

    bootstrap_trip_calendar(trip_calendar.id, client_for)


def test_reconcile_applies_google_edits_then_pushes_missed_app_changes(
    trip_calendar, event, fake_client
):
    other = Event(
        itinerary_id=event.itinerary_id,
        name="Missed push",
        address="1 Street",
        latitude=1.0,
        longitude=2.0,
        category="food",
        start_at=event.start_at,
        end_at=event.end_at,
    )
    db.session.add(other)
    db.session.commit()
    fake_client.feed = [
        {
            "id": "new",
            "etag": "e",
            "updated": LATER,
            "summary": "Reconciled in Google",
            "start": {"dateTime": "2026-08-02T10:00:00Z"},
            "end": {"dateTime": "2026-08-02T11:00:00Z"},
        }
    ]

    reconcile_trip_calendar(trip_calendar.id, lambda _: fake_client)

    assert kinds(fake_client)[0] == "list"
    assert db.session.query(Event).filter_by(name="Reconciled in Google").count() == 1
    assert find_link(trip_calendar, "event", other.id) is not None


def test_reconciling_a_calendar_that_was_removed_does_nothing(fake_client):
    reconcile_trip_calendar(999, lambda _: fake_client)

    assert fake_client.calls == []

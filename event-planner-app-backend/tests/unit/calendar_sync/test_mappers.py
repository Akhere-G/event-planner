from datetime import UTC, datetime

from src.calendar_sync.mappers import creation_mapper, get_mapper
from tests.factories import EventFactory, FlightFactory


def test_event_mapper_exports_utc_times(itinerary, admin_user):
    event = EventFactory(itinerary=itinerary, creator=admin_user)

    body = get_mapper("event").to_google(event)

    assert body["summary"] == event.name
    assert body["start"]["dateTime"].endswith("+00:00")


def test_event_mapper_applies_google_edits(itinerary, admin_user):
    event = EventFactory(itinerary=itinerary, creator=admin_user)
    google_event = {
        "summary": "Louvre",
        "start": {"dateTime": "2026-08-02T10:00:00+02:00"},
        "end": {"dateTime": "2026-08-02T12:00:00+02:00"},
    }

    get_mapper("event").apply_google(event, google_event, itinerary)

    assert event.name == "Louvre"
    assert event.start_at == datetime(2026, 8, 2, 8, 0, tzinfo=UTC)


def test_event_mapper_ignores_an_inverted_time_range(itinerary, admin_user):
    event = EventFactory(itinerary=itinerary, creator=admin_user)
    original_start = event.start_at
    google_event = {
        "start": {"dateTime": "2026-08-02T12:00:00Z"},
        "end": {"dateTime": "2026-08-02T10:00:00Z"},
    }

    get_mapper("event").apply_google(event, google_event, itinerary)

    assert event.start_at == original_start


def test_all_day_google_event_starts_at_trip_midnight(itinerary):
    itinerary.timezone = "Europe/Paris"
    google_event = {
        "summary": "Day trip",
        "start": {"date": "2026-08-03"},
        "end": {"date": "2026-08-04"},
    }

    event = creation_mapper().create_from_google(itinerary, google_event)

    assert event.start_at == datetime(2026, 8, 2, 22, 0, tzinfo=UTC)
    assert event.category == "general"


def test_flight_mapper_uses_each_airport_timezone(itinerary, admin_user):
    flight = FlightFactory(itinerary=itinerary, creator=admin_user)

    body = get_mapper("flight").to_google(flight)

    assert body["start"]["timeZone"] == "Europe/London"
    assert body["end"]["timeZone"] == "Europe/Paris"


def test_flight_mapper_only_applies_rescheduling(itinerary, admin_user):
    flight = FlightFactory(itinerary=itinerary, creator=admin_user)
    google_event = {
        "summary": "Renamed in Google",
        "start": {"dateTime": "2026-08-01T09:00:00Z"},
        "end": {"dateTime": "2026-08-01T10:30:00Z"},
    }

    get_mapper("flight").apply_google(flight, google_event, itinerary)

    assert flight.depart_at == datetime(2026, 8, 1, 9, 0, tzinfo=UTC)
    assert flight.flight_number.startswith("BA")

from datetime import UTC, datetime, timedelta

import pytest

from src.calendar_sync.mappers import (
    all_mappers,
    creation_mapper,
    get_mapper,
    has_mapper,
)
from src.calendar_sync.mappers.event_mapper import DEFAULT_NAME, EventMapper
from src.calendar_sync.mappers.flight_mapper import FlightMapper
from src.calendar_sync.mappers.times import (
    ensure_utc,
    from_google_time,
    parse_google_timestamp,
    to_google_time,
)


def test_naive_database_times_are_treated_as_utc():
    naive = datetime(2026, 8, 1, 9, 0)

    assert ensure_utc(naive) == datetime(2026, 8, 1, 9, 0, tzinfo=UTC)


def test_times_are_sent_to_google_in_utc_with_an_optional_zone():
    value = datetime(2026, 8, 1, 9, 0, tzinfo=UTC)

    assert to_google_time(value) == {"dateTime": "2026-08-01T09:00:00+00:00"}
    assert to_google_time(value, "Europe/Paris")["timeZone"] == "Europe/Paris"


def test_a_floating_google_time_uses_its_own_or_the_default_zone():
    floating = {"dateTime": "2026-08-01T10:00:00"}

    assert from_google_time(floating, "Europe/Paris") == datetime(
        2026, 8, 1, 8, 0, tzinfo=UTC
    )
    assert from_google_time({**floating, "timeZone": "Asia/Tokyo"}, None) == (
        datetime(2026, 8, 1, 1, 0, tzinfo=UTC)
    )


def test_an_all_day_google_time_starts_at_local_midnight():
    assert from_google_time({"date": "2026-08-01"}, "Europe/Paris") == datetime(
        2026, 7, 31, 22, 0, tzinfo=UTC
    )


def test_google_timestamps_are_parsed_as_utc():
    assert parse_google_timestamp("2026-08-01T09:00:00.000Z") == datetime(
        2026, 8, 1, 9, 0, tzinfo=UTC
    )


def test_registry_holds_events_and_flights_and_creates_events():
    assert has_mapper("event")
    assert has_mapper("flight")
    assert not has_mapper("accommodation")
    assert {mapper.entity for mapper in all_mappers()} == {"event", "flight"}
    assert isinstance(get_mapper("event"), EventMapper)
    assert isinstance(creation_mapper(), EventMapper)


def test_flights_cannot_be_created_from_google(itinerary):
    with pytest.raises(NotImplementedError):
        FlightMapper().create_from_google(itinerary, {})


def test_event_is_described_to_google(event):
    body = EventMapper().to_google(event)

    assert body["summary"] == event.name
    assert body["location"] == event.address
    assert body["description"] == event.description
    assert body["start"] == {"dateTime": "2026-08-20T10:00:00+00:00"}


def test_google_edits_update_the_event(event, itinerary):
    EventMapper().apply_google(
        event,
        {
            "summary": "Louvre",
            "location": "Rue de Rivoli",
            "start": {"dateTime": "2026-08-20T12:00:00+02:00"},
            "end": {"dateTime": "2026-08-20T14:00:00+02:00"},
        },
        itinerary,
    )

    assert event.name == "Louvre"
    assert event.address == "Rue de Rivoli"
    assert event.description is None
    assert ensure_utc(event.start_at) == datetime(2026, 8, 20, 10, 0, tzinfo=UTC)


def test_google_edit_without_a_name_keeps_the_existing_one(event, itinerary):
    original = event.name

    EventMapper().apply_google(
        event,
        {
            "start": {"dateTime": "2026-08-20T10:00:00Z"},
            "end": {"dateTime": "2026-08-20T11:00:00Z"},
        },
        itinerary,
    )

    assert event.name == original


def test_google_edit_ending_before_it_starts_keeps_the_old_times(event, itinerary):
    original_start = event.start_at

    EventMapper().apply_google(
        event,
        {
            "start": {"dateTime": "2026-08-21T10:00:00Z"},
            "end": {"dateTime": "2026-08-21T09:00:00Z"},
        },
        itinerary,
    )

    assert event.start_at == original_start


def test_event_created_in_google_gets_trip_defaults(itinerary, admin_user):
    created = EventMapper().create_from_google(
        itinerary,
        {
            "start": {"dateTime": "2026-08-02T10:00:00Z"},
            "end": {"dateTime": "2026-08-02T10:00:00Z"},
        },
    )

    assert created.name == DEFAULT_NAME
    assert created.address == itinerary.destination
    assert (created.latitude, created.longitude) == (
        itinerary.latitude,
        itinerary.longitude,
    )
    assert created.end_at - created.start_at == timedelta(hours=1)


def test_flight_is_described_to_google_with_airport_zones(flight):
    flight.notes = "Window seat"

    body = FlightMapper().to_google(flight)

    assert body["summary"] == f"✈ BA{flight.flight_number} LHR → CDG"
    assert body["location"] == "London, GB"
    assert body["description"] == "Notes: Window seat"
    assert body["start"]["timeZone"] == "Europe/London"
    assert body["end"]["timeZone"] == "Europe/Paris"


def test_google_only_reschedules_a_flight(flight, itinerary):
    airline = flight.airline

    FlightMapper().apply_google(
        flight,
        {
            "summary": "Renamed in Google",
            "start": {"dateTime": "2026-08-01T10:00:00+01:00"},
            "end": {"dateTime": "2026-08-01T12:30:00+02:00"},
        },
        itinerary,
    )

    assert flight.airline == airline
    assert ensure_utc(flight.depart_at) == datetime(2026, 8, 1, 9, 0, tzinfo=UTC)
    assert ensure_utc(flight.arrive_at) == datetime(2026, 8, 1, 10, 30, tzinfo=UTC)

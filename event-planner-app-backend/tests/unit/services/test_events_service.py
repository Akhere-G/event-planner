from datetime import datetime, timezone

import pytest
from marshmallow import ValidationError
from src.exceptions import EventNotFoundError
from src.services.events_service import (
    create_event,
    create_events,
    delete_event,
    get_event,
    get_events,
    update_event,
    update_events,
)
from tests.factories import EventFactory


def test_get_event_success(event):
    result = get_event(event.itinerary_id, event.id)
    assert result is not None
    assert result.id == event.id
    assert result.name == event.name


def test_get_event_not_found(itinerary):
    result = get_event(itinerary.id, 99999)
    assert result is None


def test_get_events_success(itinerary):
    for i in range(3):
        EventFactory(
            itinerary=itinerary,
            start_at=datetime(2026, 8, 20, 10 + i, 0, tzinfo=timezone.utc),
            end_at=datetime(2026, 8, 20, 12 + i, 0, tzinfo=timezone.utc),
        )

    events = get_events(itinerary.id)
    assert len(events) == 3


def test_get_events_empty(itinerary):
    events = get_events(itinerary.id)
    assert events == []


def test_create_event_success(admin_user, itinerary):
    event_data = {
        "name": "New Event",
        "address": "456 New St",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "description": "New event description",
        "start_at": datetime(2026, 8, 21, 14, 0, tzinfo=timezone.utc),
        "end_at": datetime(2026, 8, 21, 16, 0, tzinfo=timezone.utc),
        "category": "sightseeing",
        "created_by_id": admin_user.id,
        "updated_by_id": admin_user.id,
    }

    event = create_event(itinerary.id, event_data)
    assert event.id is not None
    assert event.name == "New Event"
    assert event.itinerary_id == itinerary.id


def test_create_event_rollback_on_error(itinerary):
    event_data = {
        "name": "Invalid Event",
    }

    with pytest.raises(Exception):
        create_event(itinerary.id, event_data)


def test_create_events_success(admin_user, itinerary):
    events_data = [
        {
            "name": "Event 1",
            "address": "Address 1",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc),
            "end_at": datetime(2026, 8, 20, 12, 0, tzinfo=timezone.utc),
            "category": "food",
        },
        {
            "name": "Event 2",
            "address": "Address 2",
            "latitude": 51.5074,
            "longitude": -0.1278,
            "start_at": datetime(2026, 8, 21, 10, 0, tzinfo=timezone.utc),
            "end_at": datetime(2026, 8, 21, 12, 0, tzinfo=timezone.utc),
            "category": "sightseeing",
        },
    ]

    ids = create_events(itinerary.id, events_data, admin_user.id)
    assert len(ids) == 2
    assert all(id is not None for id in ids)


def test_create_events_rollback_on_error(admin_user, itinerary):
    events_data = [
        {
            "name": "Valid Event",
            "address": "Address",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc),
            "end_at": datetime(2026, 8, 20, 12, 0, tzinfo=timezone.utc),
            "category": "food",
        },
        {
            "name": "Invalid Event",
        },
    ]

    with pytest.raises(Exception):
        create_events(itinerary.id, events_data, admin_user.id)


def test_update_event_success(event, admin_user):
    updated = update_event(
        event.itinerary_id,
        event.id,
        {
            "name": "Updated Event",
            "address": "Updated Address",
            "updated_by_id": admin_user.id,
        },
    )
    assert updated.name == "Updated Event"
    assert updated.address == "Updated Address"


def test_update_event_not_found(itinerary):
    with pytest.raises(EventNotFoundError):
        update_event(itinerary.id, 99999, {"name": "Updated"})


def test_update_event_invalid_time(event, admin_user):
    with pytest.raises(ValidationError):
        update_event(
            event.itinerary_id,
            event.id,
            {
                "start_at": datetime(2026, 8, 20, 12, 0, tzinfo=timezone.utc),
                "end_at": datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc),  # End before start
                "updated_by_id": admin_user.id,
            },
        )


def test_update_events_success(itinerary, admin_user):
    event1 = EventFactory(
        itinerary=itinerary,
        name="Event 1",
        start_at=datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc),
        end_at=datetime(2026, 8, 20, 12, 0, tzinfo=timezone.utc),
    )
    event2 = EventFactory(
        itinerary=itinerary,
        name="Event 2",
        start_at=datetime(2026, 8, 21, 10, 0, tzinfo=timezone.utc),
        end_at=datetime(2026, 8, 21, 12, 0, tzinfo=timezone.utc),
    )

    update_data = [
        {"id": event1.id, "name": "Updated Event 1"},
        {"id": event2.id, "name": "Updated Event 2"},
    ]

    updated_events = update_events(itinerary.id, update_data, admin_user.id)
    assert len(updated_events) == 2
    assert updated_events[0].name == "Updated Event 1"
    assert updated_events[1].name == "Updated Event 2"


def test_update_events_not_found(itinerary, admin_user):
    update_data = [{"id": 99999, "name": "Updated"}]

    with pytest.raises(EventNotFoundError):
        update_events(itinerary.id, update_data, admin_user.id)


def test_update_events_invalid_time(itinerary, admin_user):
    event = EventFactory(
        itinerary=itinerary,
        start_at=datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc),
        end_at=datetime(2026, 8, 20, 12, 0, tzinfo=timezone.utc),
    )

    update_data = [
        {
            "id": event.id,
            "start_at": datetime(2026, 8, 20, 12, 0, tzinfo=timezone.utc),
            "end_at": datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc),
        }
    ]

    with pytest.raises(ValidationError):
        update_events(itinerary.id, update_data, admin_user.id)


def test_delete_event_success(event):
    event_id = event.id
    itinerary_id = event.itinerary_id

    delete_event(itinerary_id, event_id)

    result = get_event(itinerary_id, event_id)
    assert result is None


def test_delete_event_not_found(itinerary):
    with pytest.raises(EventNotFoundError):
        delete_event(itinerary.id, 99999)

from datetime import datetime

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
            start_at=datetime(2026, 8, 20, 10 + i, 0),
            end_at=datetime(2026, 8, 20, 12 + i, 0),
        )

    events = get_events(itinerary.id)
    assert len(events) == 3


def test_get_events_empty(itinerary):
    events = get_events(itinerary.id)
    assert events == []


def test_create_event_success(user, itinerary):
    event_data = {
        "name": "New Event",
        "address": "456 New St",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "description": "New event description",
        "start_at": datetime(2026, 8, 21, 14, 0),
        "end_at": datetime(2026, 8, 21, 16, 0),
        "category": "sightseeing",
        "created_by_id": user.id,
        "updated_by_id": user.id,
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


def test_create_events_success(user, itinerary):
    events_data = [
        {
            "name": "Event 1",
            "address": "Address 1",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": datetime(2026, 8, 20, 10, 0),
            "end_at": datetime(2026, 8, 20, 12, 0),
            "category": "food",
        },
        {
            "name": "Event 2",
            "address": "Address 2",
            "latitude": 51.5074,
            "longitude": -0.1278,
            "start_at": datetime(2026, 8, 21, 10, 0),
            "end_at": datetime(2026, 8, 21, 12, 0),
            "category": "sightseeing",
        },
    ]

    ids = create_events(itinerary.id, events_data, user.id)
    assert len(ids) == 2
    assert all(id is not None for id in ids)


def test_create_events_rollback_on_error(user, itinerary):
    events_data = [
        {
            "name": "Valid Event",
            "address": "Address",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": datetime(2026, 8, 20, 10, 0),
            "end_at": datetime(2026, 8, 20, 12, 0),
            "category": "food",
        },
        {
            "name": "Invalid Event",
        },
    ]

    with pytest.raises(Exception):
        create_events(itinerary.id, events_data, user.id)


def test_update_event_success(event, user):
    updated = update_event(
        event.itinerary_id,
        event.id,
        {
            "name": "Updated Event",
            "address": "Updated Address",
            "updated_by_id": user.id,
        },
    )
    assert updated.name == "Updated Event"
    assert updated.address == "Updated Address"


def test_update_event_not_found(itinerary):
    with pytest.raises(EventNotFoundError):
        update_event(itinerary.id, 99999, {"name": "Updated"})


def test_update_event_invalid_time(event, user):
    with pytest.raises(ValidationError):
        update_event(
            event.itinerary_id,
            event.id,
            {
                "start_at": datetime(2026, 8, 20, 12, 0),
                "end_at": datetime(2026, 8, 20, 10, 0),  # End before start
                "updated_by_id": user.id,
            },
        )


def test_update_events_success(itinerary, user):
    event1 = EventFactory(
        itinerary=itinerary,
        name="Event 1",
        start_at=datetime(2026, 8, 20, 10, 0),
        end_at=datetime(2026, 8, 20, 12, 0),
    )
    event2 = EventFactory(
        itinerary=itinerary,
        name="Event 2",
        start_at=datetime(2026, 8, 21, 10, 0),
        end_at=datetime(2026, 8, 21, 12, 0),
    )

    update_data = [
        {"id": event1.id, "name": "Updated Event 1"},
        {"id": event2.id, "name": "Updated Event 2"},
    ]

    updated_events = update_events(itinerary.id, update_data, user.id)
    assert len(updated_events) == 2
    assert updated_events[0].name == "Updated Event 1"
    assert updated_events[1].name == "Updated Event 2"


def test_update_events_not_found(itinerary, user):
    update_data = [{"id": 99999, "name": "Updated"}]

    with pytest.raises(EventNotFoundError):
        update_events(itinerary.id, update_data, user.id)


def test_update_events_invalid_time(itinerary, user):
    event = EventFactory(
        itinerary=itinerary,
        start_at=datetime(2026, 8, 20, 10, 0),
        end_at=datetime(2026, 8, 20, 12, 0),
    )

    update_data = [
        {
            "id": event.id,
            "start_at": datetime(2026, 8, 20, 12, 0),
            "end_at": datetime(2026, 8, 20, 10, 0),
        }
    ]

    with pytest.raises(ValidationError):
        update_events(itinerary.id, update_data, user.id)


def test_delete_event_success(event):
    event_id = event.id
    itinerary_id = event.itinerary_id

    delete_event(itinerary_id, event_id)

    result = get_event(itinerary_id, event_id)
    assert result is None


def test_delete_event_not_found(itinerary):
    with pytest.raises(EventNotFoundError):
        delete_event(itinerary.id, 99999)

# tests/schemas/test_event_schema.py

from datetime import datetime

import pytest
from marshmallow import ValidationError
from src.schemas.event_schema import EventSchema

VALID_EVENT_DATA = {
    "name": "Dinner",
    "address": "123 Test St",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "description": "Dinner reservation",
    "start_at": datetime(2026, 8, 20, 10, 0),  # noqa: DTZ001
    "end_at": datetime(2026, 8, 20, 12, 0),  # noqa: DTZ001
    "category": "food",
}


def test_event_schema_loads_valid_data():
    schema = EventSchema()

    result = schema.load(VALID_EVENT_DATA)

    assert result["name"] == "Dinner"
    assert result["address"] == "123 Test St"
    assert result["latitude"] == 40.7128
    assert result["longitude"] == -74.0060
    assert result["description"] == "Dinner reservation"
    assert result["start_at"] == datetime(2026, 8, 20, 10, 0)
    assert result["end_at"] == datetime(2026, 8, 20, 12, 0)
    assert result["category"] == "food"


@pytest.mark.parametrize(
    "field, message",
    [
        ("name", "Name is required."),
        ("address", "Address is required."),
        ("latitude", "Latitude is required."),
        ("longitude", "Longitude is required."),
        ("start_at", "Start time is required."),
        ("end_at", "End time is required."),
        ("category", "Category is required."),
    ],
)
def test_event_schema_requires_fields(field, message):
    schema = EventSchema()

    data = VALID_EVENT_DATA.copy()
    data.pop(field)

    with pytest.raises(ValidationError) as exc_info:
        schema.load(data)

    assert exc_info.value.messages[field] == [message]


def test_event_schema_rejects_end_time_before_start_time():
    schema = EventSchema()

    data = {
        **VALID_EVENT_DATA,
        "start_at": datetime(2026, 8, 20, 12, 0),  # noqa: DTZ001
        "end_at": datetime(2026, 8, 20, 10, 0),  # noqa: DTZ001
    }

    with pytest.raises(ValidationError) as exc_info:
        schema.load(data)

    assert exc_info.value.messages["end_at"] == [
        "End time must be after the start time."
    ]


def test_event_schema_rejects_equal_start_and_end_times():
    schema = EventSchema()

    data = {
        **VALID_EVENT_DATA,
        "start_at": datetime(2026, 8, 20, 10, 0),  # noqa: DTZ001
        "end_at": datetime(2026, 8, 20, 10, 0),  # noqa: DTZ001
    }

    with pytest.raises(ValidationError) as exc_info:
        schema.load(data)

    assert exc_info.value.messages["end_at"] == [
        "End time must be after the start time."
    ]


def test_event_schema_allows_optional_description():
    schema = EventSchema()

    data = VALID_EVENT_DATA.copy()
    data.pop("description")

    result = schema.load(data)

    assert "description" not in result


def test_event_schema_rejects_id_on_load():
    schema = EventSchema()

    data = {
        **VALID_EVENT_DATA,
        "id": 123,
    }

    with pytest.raises(ValidationError) as exc_info:
        schema.load(data)

    assert "id" in exc_info.value.messages

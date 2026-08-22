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
    result = EventSchema().load(VALID_EVENT_DATA)

    assert result["name"] == "Dinner"
    assert result["start_at"] == datetime(2026, 8, 20, 10, 0)  # noqa: DTZ001
    assert result["end_at"] == datetime(2026, 8, 20, 12, 0)  # noqa: DTZ001


@pytest.mark.parametrize(
    "field",
    ["name", "address", "latitude", "longitude", "start_at", "end_at", "category"],
)
def test_event_schema_requires_fields(field):
    data = VALID_EVENT_DATA.copy()
    data.pop(field)

    with pytest.raises(ValidationError):
        EventSchema().load(data)


@pytest.mark.parametrize(
    "start_at,end_at",
    [
        (
            datetime(2026, 8, 20, 12, 0),  # noqa: DTZ001
            datetime(2026, 8, 20, 10, 0),  # noqa: DTZ001
        ),
        (
            datetime(2026, 8, 20, 10, 0),  # noqa: DTZ001
            datetime(2026, 8, 20, 10, 0),  # noqa: DTZ001
        ),
    ],
)
def test_event_schema_rejects_invalid_time_range(start_at, end_at):
    data = {
        **VALID_EVENT_DATA,
        "start_at": start_at,
        "end_at": end_at,
    }

    with pytest.raises(ValidationError) as exc_info:
        EventSchema().load(data)

    assert "end_at" in exc_info.value.messages


def test_event_schema_rejects_id_on_load():
    data = {
        **VALID_EVENT_DATA,
        "id": 123,
    }

    with pytest.raises(ValidationError):
        EventSchema().load(data)

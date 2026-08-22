from datetime import date

import pytest
from marshmallow import ValidationError
from src.schemas.itinerary_schema import (
    ItinerarySchema,
    ItinerarySchemaNoInvites,
    ItineraryWithRoleSchema,
)

VALID_ITINERARY_DATA = {
    "name": "Paris Trip",
    "destination": "Paris",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "description": "A trip to Paris",
    "start_date": date(2026, 8, 1),
    "end_date": date(2026, 8, 5),
}


def test_itinerary_schema_loads_valid_data():
    schema = ItinerarySchema()

    result = schema.load(VALID_ITINERARY_DATA)

    assert result["name"] == "Paris Trip"
    assert result["destination"] == "Paris"
    assert result["latitude"] == 48.8566
    assert result["longitude"] == 2.3522
    assert result["start_date"] == date(2026, 8, 1)
    assert result["end_date"] == date(2026, 8, 5)


def test_itinerary_schema_requires_required_fields():
    required_fields = [
        "name",
        "destination",
        "latitude",
        "longitude",
        "start_date",
        "end_date",
    ]

    for field in required_fields:
        schema = ItinerarySchema()

        data = VALID_ITINERARY_DATA.copy()
        data.pop(field)

        with pytest.raises(ValidationError) as exc_info:
            schema.load(data)

        assert field in exc_info.value.messages


def test_itinerary_schema_rejects_end_date_before_start_date():
    schema = ItinerarySchema()

    data = {
        **VALID_ITINERARY_DATA,
        "start_date": date(2026, 8, 10),
        "end_date": date(2026, 8, 5),
    }

    with pytest.raises(ValidationError) as exc_info:
        schema.load(data)

    assert exc_info.value.messages["end_date"] == [
        "End date must be after the start date."
    ]


def test_itinerary_schema_rejects_id_on_load():
    schema = ItinerarySchema()

    data = {
        **VALID_ITINERARY_DATA,
        "id": 123,
    }

    with pytest.raises(ValidationError) as exc_info:
        schema.load(data)

    assert "id" in exc_info.value.messages


@pytest.mark.parametrize("role", ["admin", "editor", "viewer"])
def test_itinerary_with_role_accepts_valid_roles(role, itinerary):
    schema = ItineraryWithRoleSchema()

    data = {
        "itinerary": itinerary,
        "role": role,
    }

    result = schema.dump(data)

    assert result["role"] == role


def test_itinerary_with_role_rejects_invalid_role():
    schema = ItineraryWithRoleSchema()

    with pytest.raises(ValidationError):
        schema.load(
            {
                "itinerary": VALID_ITINERARY_DATA,
                "role": "invalid",
            }
        )


def test_itinerary_with_role_flattens_output_for_admin(itinerary):
    schema = ItineraryWithRoleSchema()

    result = schema.dump(
        {
            "itinerary": itinerary,
            "role": "admin",
        }
    )

    assert result["name"] == itinerary.name
    assert result["role"] == "admin"

    assert "viewer_code" in result
    assert "editor_code" in result
    assert "admin_code" in result


@pytest.mark.parametrize("role", ["editor", "viewer"])
def test_itinerary_with_role_removes_codes_for_non_admin(
    itinerary,
    role,
):
    schema = ItineraryWithRoleSchema()

    result = schema.dump(
        {
            "itinerary": itinerary,
            "role": role,
        }
    )

    assert result["name"] == itinerary.name
    assert result["role"] == role

    assert "viewer_code" not in result
    assert "editor_code" not in result
    assert "admin_code" not in result


def test_itinerary_schema_no_invites_contains_expected_fields(itinerary):
    schema = ItinerarySchemaNoInvites()

    result = schema.dump(itinerary)

    assert "id" in result
    assert "name" in result
    assert "description" in result
    assert "start_date" in result
    assert "end_date" in result

    assert "events" in result
    assert "user_memberships" in result

    assert "invites" not in result
    assert "destination" not in result
    assert "latitude" not in result
    assert "longitude" not in result


def test_itinerary_schema_no_invites_loads_valid_data():
    schema = ItinerarySchemaNoInvites()

    data = {
        "name": "Paris Trip",
        "description": "A trip to Paris",
        "start_date": date(2026, 8, 1),
        "end_date": date(2026, 8, 5),
    }

    result = schema.load(data)

    assert result["name"] == "Paris Trip"
    assert result["description"] == "A trip to Paris"
    assert result["start_date"] == date(2026, 8, 1)
    assert result["end_date"] == date(2026, 8, 5)

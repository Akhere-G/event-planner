import pytest
from src.schemas.base_schema import BaseSchema


class DummySchema(BaseSchema):
    pass


@pytest.fixture
def schema():
    return DummySchema()


def test_camel_case_keys_are_converted_to_snake_case(schema):
    data = {
        "firstName": "Anthony",
        "lastName": "Smith",
        "startDate": "2026-08-22",
        "createdAt": "2026-08-22T12:00:00",
    }

    result = schema.camel_to_snake(
        data,
        many=False,
        partial=False,
    )

    assert result == {
        "first_name": "Anthony",
        "last_name": "Smith",
        "start_date": "2026-08-22",
        "created_at": "2026-08-22T12:00:00",
    }


def test_snake_case_keys_are_unchanged(schema):
    data = {
        "first_name": "Anthony",
        "start_date": "2026-08-22",
    }

    result = schema.camel_to_snake(
        data,
        many=False,
        partial=False,
    )

    assert result == data


def test_mixed_case_keys_are_converted(schema):
    data = {
        "firstName": "Anthony",
        "last_name": "Smith",
        "startDate": "2026-08-22",
    }

    result = schema.camel_to_snake(
        data,
        many=False,
        partial=False,
    )

    assert result == {
        "first_name": "Anthony",
        "last_name": "Smith",
        "start_date": "2026-08-22",
    }


@pytest.mark.parametrize("data", [{}, None])
def test_empty_input_is_returned_unchanged(schema, data):
    result = schema.camel_to_snake(
        data,
        many=False,
        partial=False,
    )

    assert result == data

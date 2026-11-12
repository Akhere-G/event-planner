import pytest
from marshmallow import ValidationError
from src.schemas.trip_template_schema import (
    CloneTemplateSchema,
    PublishTemplateSchema,
    TemplateListQuerySchema,
    normalise_template_ops,
)


def event_op(**overrides):
    data = {
        "name": "Louvre",
        "address": "Rue de Rivoli, Paris",
        "latitude": 48.86,
        "longitude": 2.33,
        "category": "Culture",
        "day_offset": 0,
        "start_time": "09:30",
        "end_day_offset": 0,
        "end_time": "12:00",
    }
    return {"op": "create", "entity": "event", "data": {**data, **overrides}}


def test_normalise_fills_defaults_and_keeps_times_as_text():
    ops = normalise_template_ops([event_op()])

    assert ops == [
        {
            "op": "create",
            "entity": "event",
            "data": {
                "name": "Louvre",
                "description": None,
                "address": "Rue de Rivoli, Paris",
                "latitude": 48.86,
                "longitude": 2.33,
                "category": "Culture",
                "day_offset": 0,
                "start_time": "09:30",
                "end_day_offset": 0,
                "end_time": "12:00",
            },
        }
    ]


def test_event_must_end_after_it_starts():
    with pytest.raises(ValidationError):
        normalise_template_ops([event_op(end_time="09:30")])


def test_event_may_end_on_a_later_day():
    ops = normalise_template_ops([event_op(end_day_offset=1, end_time="02:00")])

    assert ops[0]["data"]["end_day_offset"] == 1


def test_rejects_unknown_entities_and_non_create_ops():
    with pytest.raises(ValidationError):
        normalise_template_ops([{"op": "create", "entity": "expense", "data": {}}])
    with pytest.raises(ValidationError):
        normalise_template_ops([{**event_op(), "op": "delete"}])


def test_accommodation_checkout_cannot_precede_checkin():
    op = {
        "op": "create",
        "entity": "accommodation",
        "data": {
            "name": "Hotel",
            "address": "1 Rue",
            "latitude": 1,
            "longitude": 1,
            "start_day_offset": 2,
            "end_day_offset": 1,
        },
    }

    with pytest.raises(ValidationError):
        normalise_template_ops([op])


def test_rejects_an_empty_op_list():
    with pytest.raises(ValidationError):
        normalise_template_ops([])


def test_publish_requires_a_known_region():
    assert PublishTemplateSchema().load({"region": "North America"})["region"] == (
        "North America"
    )
    with pytest.raises(ValidationError):
        PublishTemplateSchema().load({})
    with pytest.raises(ValidationError):
        PublishTemplateSchema().load({"region": "Atlantis"})


def test_clone_reads_a_camel_case_start_date():
    loaded = CloneTemplateSchema().load({"startDate": "2026-03-20"})

    assert loaded["start_date"].isoformat() == "2026-03-20"


def test_list_query_splits_regions_and_applies_defaults():
    query = TemplateListQuerySchema().load({"regions": "Asia, Europe"})

    assert query == {
        "search": None,
        "regions": ["Asia", "Europe"],
        "limit": 12,
        "offset": 0,
    }


def test_list_query_rejects_unknown_regions():
    with pytest.raises(ValidationError):
        TemplateListQuerySchema().load({"regions": "Asia,Atlantis"})

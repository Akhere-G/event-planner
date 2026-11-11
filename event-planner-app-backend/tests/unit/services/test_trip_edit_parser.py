from unittest.mock import patch

import pytest

from src.ai_entities.context import Requester
from src.exceptions import AIResponseError
from src.schemas.change_set_schema import MAX_OPS_PER_CHANGE_SET
from src.services.trip_edit.parser import parse_edit_ops
from src.services.trip_edit.registry import build_editable_entities
from tests.factories import EventFactory, ItineraryFactory, WishlistItemFactory

LOOKUP = "src.ai_entities.places.get_place_details"
PLACE = {
    "latitude": 48.86,
    "longitude": 2.33,
    "formatted_address": "Rue de Rivoli, Paris",
}
EDITOR = Requester(user_id=None, role="editor", members={})
ADMIN = Requester(user_id=1, role="admin", members={1: "Ann"})


def parse(itinerary, raw, requester=EDITOR):
    return parse_edit_ops(raw, build_editable_entities(itinerary, requester, []))


def test_a_valid_update_keeps_only_allowed_fields(itinerary, event):
    raw = [
        {
            "op": "update",
            "entity": "event",
            "id": event.id,
            "data": {"name": "Brunch", "created_by_id": 99, "latitude": 1},
            "reason": "  Earlier  ",
        }
    ]

    assert parse(itinerary, raw) == [
        {
            "op": "update",
            "entity": "event",
            "id": event.id,
            "label": event.name,
            "data": {"name": "Brunch"},
            "reason": "Earlier",
        }
    ]


def test_a_delete_keeps_no_data(itinerary, event):
    raw = [{"op": "delete", "entity": "event", "id": event.id, "data": {"x": 1}}]

    assert parse(itinerary, raw) == [
        {
            "op": "delete",
            "entity": "event",
            "id": event.id,
            "label": event.name,
            "data": {},
            "reason": None,
        }
    ]


def test_the_time_of_an_update_is_converted_to_utc(itinerary, event):
    data = {"start_at": "2026-08-02T19:00:00", "end_at": "2026-08-02T21:00:00"}
    raw = [{"op": "update", "entity": "event", "id": event.id, "data": data}]

    ops = parse(itinerary, raw)

    assert ops[0]["data"]["start_at"] == "2026-08-02T17:00:00+00:00"


def test_an_item_of_another_trip_is_dropped(itinerary, event):
    foreign = EventFactory(itinerary=ItineraryFactory())
    raw = [
        {"op": "delete", "entity": "event", "id": foreign.id},
        {"op": "update", "entity": "event", "id": foreign.id, "data": {"name": "X"}},
    ]

    assert parse(itinerary, raw) == []


def test_an_id_of_another_entity_is_dropped(itinerary, event):
    raw = [{"op": "delete", "entity": "packing_item", "id": event.id}]

    assert parse(itinerary, raw) == []


@pytest.mark.parametrize(
    "raw",
    [
        "delete everything",
        {"op": "drop", "entity": "event", "id": 1},
        {"op": "delete", "entity": "flight", "id": 1},
        {"op": "delete", "entity": ["event"], "id": 1},
        {"op": ["delete"], "entity": "event", "id": 1},
        {"op": "delete", "entity": "event", "id": True},
        {"op": "delete", "entity": "event", "id": "1"},
        {"op": "delete", "entity": "event"},
        {"op": "create", "entity": "packing_item", "data": "Passport"},
        {"op": "create", "entity": "packing_item", "data": {}},
        {"op": "create", "entity": "packing_item", "data": {"category": "Docs"}},
    ],
)
def test_malformed_ops_are_dropped(itinerary, event, raw):
    assert parse(itinerary, [raw]) == []


def test_an_update_with_only_unknown_fields_is_dropped(itinerary, event):
    raw = [{"op": "update", "entity": "event", "id": event.id, "data": {"x": 1}}]

    assert parse(itinerary, raw) == []


def test_an_update_with_unusable_times_is_dropped(itinerary, event):
    data = {"start_at": "2026-08-02T19:00:00"}
    raw = [{"op": "update", "entity": "event", "id": event.id, "data": data}]

    assert parse(itinerary, raw) == []


def test_only_the_first_op_on_an_item_is_kept(itinerary, event):
    raw = [
        {"op": "update", "entity": "event", "id": event.id, "data": {"name": "A"}},
        {"op": "delete", "entity": "event", "id": event.id},
    ]

    ops = parse(itinerary, raw)

    assert len(ops) == 1
    assert ops[0]["op"] == "update"


def test_a_created_event_is_placed_and_has_no_id_or_label(itinerary):
    data = {
        "name": "Louvre",
        "start_at": "2026-08-02T10:00:00",
        "end_at": "2026-08-02T12:00:00",
        "address": "Rue de Rivoli",
        "category": "Museum",
    }
    raw = [{"op": "create", "entity": "event", "data": data}]

    with patch(LOOKUP, return_value=PLACE):
        ops = parse(itinerary, raw)

    assert "id" not in ops[0]
    assert "label" not in ops[0]
    assert ops[0]["data"]["latitude"] == 48.86


def test_a_created_event_that_cannot_be_placed_is_dropped(itinerary):
    data = {
        "name": "Nowhere",
        "start_at": "2026-08-02T10:00:00",
        "end_at": "2026-08-02T12:00:00",
    }
    raw = [{"op": "create", "entity": "event", "data": data}]

    with patch(LOOKUP, side_effect=RuntimeError("no such place")):
        assert parse(itinerary, raw) == []


def test_wishlist_name_is_only_kept_when_creating(itinerary, wishlist):
    item = WishlistItemFactory(wishlist=wishlist)
    update = {"name": "New", "wishlist_name": "Other"}
    create = {"name": "Orsay", "wishlist_name": "Museums"}
    raw = [
        {"op": "update", "entity": "wishlist_item", "id": item.id, "data": update},
        {"op": "create", "entity": "wishlist_item", "data": create},
    ]

    with patch(LOOKUP, side_effect=RuntimeError("no such place")):
        ops = parse(itinerary, raw)

    assert ops[0]["data"] == {"name": "New"}
    assert ops[1]["data"] == create


def test_ops_are_capped(itinerary):
    raw = []
    for number in range(MAX_OPS_PER_CHANGE_SET + 5):
        data = {"name": f"Item {number}"}
        raw.append({"op": "create", "entity": "packing_item", "data": data})

    assert len(parse(itinerary, raw)) == MAX_OPS_PER_CHANGE_SET


@pytest.mark.parametrize("raw", [{"op": "delete"}, "ops", None])
def test_ops_that_are_not_a_list_are_an_error(itinerary, raw):
    with pytest.raises(AIResponseError):
        parse(itinerary, raw)


def test_an_op_kind_the_entity_does_not_allow_is_dropped(itinerary):
    raw = [
        {"op": "create", "entity": "trip", "data": {"budget_amount_gbp": 5}},
        {"op": "delete", "entity": "trip", "id": itinerary.id},
    ]

    assert parse(itinerary, raw, ADMIN) == []


def test_the_trip_can_be_updated_by_an_admin_only(itinerary):
    raw = [
        {
            "op": "update",
            "entity": "trip",
            "id": itinerary.id,
            "data": {"budget_amount_gbp": 500},
        }
    ]

    assert parse(itinerary, raw, ADMIN)[0]["label"] == "Trip dates and budget"
    assert parse(itinerary, raw, EDITOR) == []

from unittest.mock import patch

import pytest
from src.exceptions import AIResponseError
from src.schemas.change_set_schema import MAX_OPS_PER_CHANGE_SET
from src.services.trip_edit.entity_editors import EDITORS
from src.services.trip_edit.sanitiser import sanitise_edit_ops
from tests.factories import EventFactory, ItineraryFactory, WishlistItemFactory

PLACE = {"latitude": 48.86, "longitude": 2.33, "address": "Rue de Rivoli, Paris"}
GEOCODE = "src.services.trip_edit.entity_editors.geocode"


def editors_for(itinerary):
    editors = {}
    for entity, editor_class in EDITORS.items():
        editors[entity] = editor_class(itinerary, None, [])
    return editors


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

    ops = sanitise_edit_ops(raw, editors_for(itinerary))

    assert ops == [
        {
            "op": "update",
            "entity": "event",
            "id": event.id,
            "data": {"name": "Brunch"},
            "reason": "Earlier",
        }
    ]


def test_a_delete_keeps_no_data(itinerary, event):
    raw = [{"op": "delete", "entity": "event", "id": event.id, "data": {"x": 1}}]

    ops = sanitise_edit_ops(raw, editors_for(itinerary))

    assert ops == [
        {"op": "delete", "entity": "event", "id": event.id, "data": {}, "reason": None}
    ]


def test_the_time_of_an_update_is_converted_to_utc(itinerary, event):
    data = {"start_at": "2026-08-02T19:00:00", "end_at": "2026-08-02T21:00:00"}
    raw = [{"op": "update", "entity": "event", "id": event.id, "data": data}]

    ops = sanitise_edit_ops(raw, editors_for(itinerary))

    assert ops[0]["data"]["start_at"] == "2026-08-02T17:00:00+00:00"


def test_an_item_of_another_trip_is_dropped(itinerary, event):
    foreign = EventFactory(itinerary=ItineraryFactory())
    raw = [
        {"op": "delete", "entity": "event", "id": foreign.id},
        {"op": "update", "entity": "event", "id": foreign.id, "data": {"name": "X"}},
    ]

    assert sanitise_edit_ops(raw, editors_for(itinerary)) == []


def test_an_id_of_another_entity_is_dropped(itinerary, event):
    raw = [{"op": "delete", "entity": "packing_item", "id": event.id}]

    assert sanitise_edit_ops(raw, editors_for(itinerary)) == []


@pytest.mark.parametrize(
    "raw",
    [
        "delete everything",
        {"op": "drop", "entity": "event", "id": 1},
        {"op": "delete", "entity": "flight", "id": 1},
        {"op": "delete", "entity": ["event"], "id": 1},
        {"op": "delete", "entity": "event", "id": True},
        {"op": "delete", "entity": "event", "id": "1"},
        {"op": "delete", "entity": "event"},
        {"op": "create", "entity": "packing_item", "data": "Passport"},
        {"op": "create", "entity": "packing_item", "data": {}},
        {"op": "create", "entity": "packing_item", "data": {"category": "Docs"}},
    ],
)
def test_malformed_ops_are_dropped(itinerary, event, raw):
    assert sanitise_edit_ops([raw], editors_for(itinerary)) == []


def test_an_update_with_only_unknown_fields_is_dropped(itinerary, event):
    raw = [{"op": "update", "entity": "event", "id": event.id, "data": {"x": 1}}]

    assert sanitise_edit_ops(raw, editors_for(itinerary)) == []


def test_an_update_with_unusable_times_is_dropped(itinerary, event):
    data = {"start_at": "2026-08-02T19:00:00"}
    raw = [{"op": "update", "entity": "event", "id": event.id, "data": data}]

    assert sanitise_edit_ops(raw, editors_for(itinerary)) == []


def test_only_the_first_op_on_an_item_is_kept(itinerary, event):
    raw = [
        {"op": "update", "entity": "event", "id": event.id, "data": {"name": "A"}},
        {"op": "delete", "entity": "event", "id": event.id},
    ]

    ops = sanitise_edit_ops(raw, editors_for(itinerary))

    assert len(ops) == 1
    assert ops[0]["op"] == "update"


def test_a_created_event_is_placed_and_has_no_id(itinerary):
    data = {
        "name": "Louvre",
        "start_at": "2026-08-02T10:00:00",
        "end_at": "2026-08-02T12:00:00",
        "address": "Rue de Rivoli",
        "category": "Museum",
    }
    raw = [{"op": "create", "entity": "event", "data": data}]

    with patch(GEOCODE, return_value=PLACE):
        ops = sanitise_edit_ops(raw, editors_for(itinerary))

    assert "id" not in ops[0]
    assert ops[0]["data"]["latitude"] == 48.86


def test_a_created_event_that_cannot_be_placed_is_dropped(itinerary):
    data = {
        "name": "Nowhere",
        "start_at": "2026-08-02T10:00:00",
        "end_at": "2026-08-02T12:00:00",
    }
    raw = [{"op": "create", "entity": "event", "data": data}]

    with patch(GEOCODE, return_value=None):
        assert sanitise_edit_ops(raw, editors_for(itinerary)) == []


def test_wishlist_name_is_only_kept_when_creating(itinerary, wishlist):
    item = WishlistItemFactory(wishlist=wishlist)
    update = {"name": "New", "wishlist_name": "Other"}
    create = {"name": "Orsay", "wishlist_name": "Museums"}
    raw = [
        {"op": "update", "entity": "wishlist_item", "id": item.id, "data": update},
        {"op": "create", "entity": "wishlist_item", "data": create},
    ]

    ops = sanitise_edit_ops(raw, editors_for(itinerary))

    assert ops[0]["data"] == {"name": "New"}
    assert ops[1]["data"] == create


def test_ops_are_capped(itinerary):
    raw = []
    for number in range(MAX_OPS_PER_CHANGE_SET + 5):
        data = {"name": f"Item {number}"}
        raw.append({"op": "create", "entity": "packing_item", "data": data})

    assert len(sanitise_edit_ops(raw, editors_for(itinerary))) == MAX_OPS_PER_CHANGE_SET


def test_ops_that_are_not_a_list_are_an_error(itinerary):
    with pytest.raises(AIResponseError):
        sanitise_edit_ops({"op": "delete"}, editors_for(itinerary))

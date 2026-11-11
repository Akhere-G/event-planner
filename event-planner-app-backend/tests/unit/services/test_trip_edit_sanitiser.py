from unittest.mock import patch

import pytest
from src.exceptions import AIResponseError
from src.schemas.change_set_schema import MAX_OPS_PER_CHANGE_SET
from src.services.trip_edit.editor_base import EntityEditor
from src.services.trip_edit.registry import build_editors
from src.services.trip_edit.sanitiser import sanitise_edit_ops
from tests.factories import (
    EventFactory,
    ItineraryFactory,
    WishlistItemFactory,
    edit_context,
)

PLACE = {"latitude": 48.86, "longitude": 2.33, "address": "Rue de Rivoli, Paris"}
GEOCODE = "src.services.trip_edit.entity_editors.geocode"


def editors_for(itinerary):
    return build_editors(edit_context(itinerary))


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
            "label": event.name,
            "data": {"name": "Brunch"},
            "reason": "Earlier",
        }
    ]


def test_a_delete_keeps_no_data(itinerary, event):
    raw = [{"op": "delete", "entity": "event", "id": event.id, "data": {"x": 1}}]

    ops = sanitise_edit_ops(raw, editors_for(itinerary))

    assert ops == [
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


class CreateOnlyEditor(EntityEditor):
    entity = "note"
    title = "NOTES"
    fields = ("text", "pinned")
    kinds = ("create",)
    create_required = ("text",)
    hint = "text"

    def describe_items(self, itinerary):
        return {7: "a note"}


def note_editors(itinerary):
    return {"note": CreateOnlyEditor(edit_context(itinerary))}


def test_an_op_kind_the_editor_does_not_allow_is_dropped(itinerary):
    raw = [
        {"op": "delete", "entity": "note", "id": 7},
        {"op": "update", "entity": "note", "id": 7, "data": {"text": "x"}},
    ]

    assert sanitise_edit_ops(raw, note_editors(itinerary)) == []


def test_a_create_needs_the_fields_the_editor_requires(itinerary):
    editors = note_editors(itinerary)
    without = {"op": "create", "entity": "note", "data": {"pinned": True}}
    with_text = {"op": "create", "entity": "note", "data": {"text": "Hi"}}

    ops = sanitise_edit_ops([without, with_text], editors)

    assert [op["data"] for op in ops] == [{"text": "Hi"}]


def test_an_item_is_labelled_with_its_name_but_a_create_has_none(itinerary, event):
    raw = [
        {"op": "delete", "entity": "event", "id": event.id},
        {"op": "create", "entity": "packing_item", "data": {"name": "Hat"}},
    ]

    ops = sanitise_edit_ops(raw, editors_for(itinerary))

    assert ops[0]["label"] == event.name
    assert "label" not in ops[1]

from unittest.mock import patch

from src.ai_entities.context import Requester
from src.services.trip_edit.registry import build_editable_entities

LOOKUP = "src.ai_entities.places.get_place_details"


def test_a_signed_in_admin_may_edit_every_entity(itinerary):
    admin = Requester(user_id=1, role="admin", members={1: "Ann"})

    entities = build_editable_entities(itinerary, admin, [])

    assert list(entities) == [
        "trip",
        "event",
        "accommodation",
        "packing_item",
        "wishlist",
        "wishlist_item",
        "expense",
        "settlement",
    ]


def test_entities_the_requester_may_not_edit_are_left_out(itinerary):
    editor = Requester(user_id=None, role="editor", members={})

    assert list(build_editable_entities(itinerary, editor, [])) == [
        "event",
        "accommodation",
        "packing_item",
        "wishlist",
        "wishlist_item",
    ]


def test_each_entity_is_described_and_validated_from_the_same_snapshot(
    itinerary, event
):
    editor = Requester(user_id=None, role="editor", members={})

    events = build_editable_entities(itinerary, editor, [])["event"]

    assert events.title == "EVENTS"
    assert list(events.descriptions) == [event.id]
    assert events.validator.knows(event.id)
    assert events.lines[0].startswith(f"- id={event.id} | {event.name}")


def test_the_places_the_trip_already_holds_are_not_looked_up_again(itinerary, event):
    editor = Requester(user_id=None, role="editor", members={})
    events = build_editable_entities(itinerary, editor, [])["event"].validator
    raw = {
        "name": "Again",
        "address": event.address,
        "start_at": "2026-08-02T10:00:00",
        "end_at": "2026-08-02T12:00:00",
    }

    with patch(LOOKUP) as lookup:
        checked = events.validate_create(raw)

    lookup.assert_not_called()
    assert checked["latitude"] == float(event.latitude)

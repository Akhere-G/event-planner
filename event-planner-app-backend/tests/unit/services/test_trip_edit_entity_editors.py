from datetime import datetime
from unittest.mock import patch

from src.models import PackingItem
from src.services.flight_context import FlightWindow
from src.services.trip_edit.entity_editors import (
    EventEditor,
    PackingItemEditor,
    WishlistItemEditor,
)
from src.extensions import db
from tests.factories import WishlistItemFactory

PLACE = {"latitude": 48.86, "longitude": 2.33, "address": "Rue de Rivoli, Paris"}
GEOCODE = "src.services.trip_edit.entity_editors.geocode"


def event_editor(itinerary, flights=()):
    return EventEditor(itinerary, None, list(flights))


def test_event_lines_show_the_id_and_trip_local_times(itinerary, event):
    lines = event_editor(itinerary).lines()

    assert lines == [
        f"- id={event.id} | {event.name} | 2026-08-20T12:00 to 2026-08-20T14:00 | "
        f"{event.address} | {event.category}"
    ]
    assert event_editor(itinerary).ids() == {event.id}


def test_an_update_converts_local_times_to_utc(itinerary):
    data = {"start_at": "2026-08-02T19:00:00", "end_at": "2026-08-02T21:00:00"}

    result = event_editor(itinerary).normalise("update", data)

    assert result == {
        "start_at": "2026-08-02T17:00:00+00:00",
        "end_at": "2026-08-02T19:00:00+00:00",
    }


def test_an_offset_the_model_adds_is_ignored(itinerary):
    data = {"start_at": "2026-08-02T19:00:00Z", "end_at": "2026-08-02T21:00:00Z"}

    result = event_editor(itinerary).normalise("update", data)

    assert result["start_at"] == "2026-08-02T17:00:00+00:00"


def test_an_update_without_times_is_left_alone(itinerary):
    assert event_editor(itinerary).normalise("update", {"name": "Brunch"}) == {
        "name": "Brunch"
    }


def test_bad_times_are_rejected(itinerary):
    editor = event_editor(itinerary)
    one_sided = {"start_at": "2026-08-02T19:00:00"}
    backwards = {"start_at": "2026-08-02T21:00:00", "end_at": "2026-08-02T19:00:00"}
    garbage = {"start_at": "tonight", "end_at": "later"}
    numbers = {"start_at": 19, "end_at": 21}

    for data in (one_sided, backwards, garbage, numbers):
        assert editor.normalise("update", data) is None


def test_a_time_inside_a_flight_window_is_rejected(itinerary):
    flight = FlightWindow(
        "BA123 LHR → CDG", datetime(2026, 8, 2, 20, 0), datetime(2026, 8, 2, 22, 0)
    )
    data = {"start_at": "2026-08-02T19:00:00", "end_at": "2026-08-02T21:00:00"}

    assert event_editor(itinerary, [flight]).normalise("update", data) is None


def test_a_created_event_gets_its_coordinates_and_utc_times(itinerary):
    data = {
        "name": "Louvre",
        "start_at": "2026-08-02T10:00:00",
        "end_at": "2026-08-02T12:00:00",
    }

    with patch(GEOCODE, return_value=PLACE) as geocode:
        result = event_editor(itinerary).normalise("create", data)

    geocode.assert_called_once_with(itinerary.id, "Louvre", None)
    assert result["latitude"] == 48.86
    assert result["address"] == "Rue de Rivoli, Paris"
    assert result["start_at"] == "2026-08-02T08:00:00+00:00"


def test_a_created_event_that_cannot_be_placed_is_rejected(itinerary):
    data = {
        "name": "Nowhere",
        "start_at": "2026-08-02T10:00:00",
        "end_at": "2026-08-02T12:00:00",
    }

    with patch(GEOCODE, return_value=None):
        assert event_editor(itinerary).normalise("create", data) is None


def test_a_created_event_needs_both_times(itinerary):
    with patch(GEOCODE, return_value=PLACE):
        assert event_editor(itinerary).normalise("create", {"name": "Louvre"}) is None


def test_the_address_can_only_be_set_when_creating(itinerary):
    editor = event_editor(itinerary)

    assert "address" in editor.allowed_fields("create")
    assert "address" not in editor.allowed_fields("update")


def test_packing_items_hide_other_peoples_personal_items(
    itinerary, admin_user, editor_user
):
    shared = PackingItem(
        itinerary_id=itinerary.id, name="Tent", category="Camp", is_shared=True
    )
    mine = PackingItem(
        itinerary_id=itinerary.id,
        name="Meds",
        category="Health",
        is_shared=False,
        owner_id=editor_user.id,
    )
    theirs = PackingItem(
        itinerary_id=itinerary.id,
        name="Diary",
        category="Misc",
        is_shared=False,
        owner_id=admin_user.id,
    )
    for item in (shared, mine, theirs):
        item.created_by_id = item.updated_by_id = admin_user.id
        itinerary.packing_items.append(item)
    db.session.flush()

    editor = PackingItemEditor(itinerary, editor_user.id, [])

    assert editor.ids() == {shared.id, mine.id}


def test_wishlist_items_are_described_with_their_list(itinerary, wishlist):
    item = WishlistItemFactory(wishlist=wishlist, name="Orsay")

    editor = WishlistItemEditor(itinerary, None, [])

    assert editor.lines() == [f"- id={item.id} | Orsay | list: {wishlist.name}"]
    assert "wishlist_name" in editor.allowed_fields("create")
    assert "wishlist_name" not in editor.allowed_fields("update")


def test_a_created_wishlist_item_with_an_address_is_geocoded(itinerary):
    editor = WishlistItemEditor(itinerary, None, [])

    with patch(GEOCODE, return_value=PLACE):
        result = editor.normalise("create", {"name": "Orsay", "address": "Paris"})

    assert result["latitude"] == 48.86


def test_a_wishlist_item_that_cannot_be_placed_is_kept_without_coordinates(itinerary):
    editor = WishlistItemEditor(itinerary, None, [])
    data = {"name": "Orsay", "address": "Paris"}

    with patch(GEOCODE, return_value=None):
        assert editor.normalise("create", data) == data

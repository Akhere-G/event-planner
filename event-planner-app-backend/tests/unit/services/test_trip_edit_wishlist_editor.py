import pytest
from src.services.trip_edit.wishlist_editor import WishlistEditor
from tests.factories import WishlistFactory, WishlistItemFactory, edit_context


def wishlist_editor(itinerary):
    return WishlistEditor(edit_context(itinerary))


def test_a_list_is_described_by_its_name_and_size(itinerary, wishlist):
    WishlistItemFactory(wishlist=wishlist)
    WishlistItemFactory(wishlist=wishlist)

    editor = wishlist_editor(itinerary)

    assert editor.lines() == [f"- id={wishlist.id} | {wishlist.name} | 2 items"]
    assert editor.ids() == {wishlist.id}


def test_a_new_name_is_trimmed(itinerary, wishlist):
    result = wishlist_editor(itinerary).normalise(
        "update", wishlist.id, {"name": "  Cafes "}
    )

    assert result == {"name": "Cafes"}


@pytest.mark.parametrize("name", ["", "   ", None, 7])
def test_a_blank_or_odd_name_is_rejected(itinerary, wishlist, name):
    editor = wishlist_editor(itinerary)

    assert editor.normalise("create", None, {"name": name}) is None


def test_a_name_another_list_already_has_is_rejected_whatever_its_case(
    itinerary, wishlist
):
    WishlistFactory(itinerary=itinerary, name="Museums")
    editor = wishlist_editor(itinerary)

    assert editor.normalise("create", None, {"name": "museums"}) is None
    assert editor.normalise("update", wishlist.id, {"name": "Museums "}) is None

from typing import Any

from ...models import Itinerary
from .editor_base import EntityEditor


class WishlistEditor(EntityEditor):
    """Whole wishlists: add an empty list, rename one, or remove one with its items."""

    entity = "wishlist"
    title = "WISHLISTS"
    fields = ("name",)
    hint = "name (the list's name; it must not match another list)"
    notes = (
        "removing a list removes its items too, so send no ops for the items of a "
        "list you remove. To add an item to a list that does not exist yet, create "
        "the item with a wishlist_name instead of creating the list."
    )

    def describe_entities(self, itinerary: Itinerary) -> dict[int, str]:
        self.names: dict[int, str] = {}
        descriptions = {}
        for wishlist in itinerary.wishlists:
            self.names[wishlist.id] = wishlist.name
            descriptions[wishlist.id] = f"{wishlist.name} | {len(wishlist.items)} items"
        return descriptions

    def normalise(
        self, kind: str, item_id: int | None, data: dict[str, Any]
    ) -> dict[str, Any] | None:
        name = data["name"]
        if not isinstance(name, str) or not name.strip() or self._is_taken(name):
            return None
        return {**data, "name": name.strip()}

    def _is_taken(self, name: str) -> bool:
        for existing in self.names.values():
            if existing.casefold() == name.strip().casefold():
                return True
        return False

from ..describers.base import EntityDescription
from ..json_types import JsonObject
from ..parsing import clean_text
from .base import EntityValidator

_LIMIT = 255


class WishlistValidator(EntityValidator):
    entity = "wishlist"
    fields = ("name",)
    prompt_hint = "name (the list's name; it must not match another list)"
    prompt_notes = (
        "removing a list removes its items too, so send no ops for the items of a "
        "list you remove. To add an item to a list that does not exist yet, create "
        "the item with a wishlist_name instead of creating the list."
    )

    def tidy(self, data: JsonObject) -> JsonObject:
        return {"name": clean_text(data["name"], _LIMIT)} if "name" in data else data

    def check_create(self, data: JsonObject) -> JsonObject | None:
        return None if self._is_unusable(data) else data

    def check_edit(
        self, current: EntityDescription, data: JsonObject
    ) -> JsonObject | None:
        return None if self._is_unusable(data) else data

    def _is_unusable(self, data: JsonObject) -> bool:
        name = data["name"]
        if not isinstance(name, str):
            return True
        for saved in self.existing.values():
            if str(saved.values["name"]).casefold() == name.casefold():
                return True
        return False


class WishlistItemValidator(EntityValidator):
    entity = "wishlist_item"
    fields = ("name", "description")
    create_only_fields = ("address", "wishlist_name")
    prompt_hint = (
        "name, description; address and wishlist_name (the list to add it to) "
        "only when creating"
    )

    def tidy(self, data: JsonObject) -> JsonObject:
        tidied = dict(data)
        for field in ("name", "description"):
            if field in tidied:
                tidied[field] = clean_text(tidied[field], _LIMIT)
        return tidied

    def check_create(self, data: JsonObject) -> JsonObject | None:
        if not data["name"]:
            return None
        return self._located(data, str(data["name"])) or data

    def check_edit(
        self, current: EntityDescription, data: JsonObject
    ) -> JsonObject | None:
        return None if "name" in data and not data["name"] else data

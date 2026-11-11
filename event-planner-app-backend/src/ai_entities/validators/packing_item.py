from ...services.change_set_appliers import PackingItemChangeSetApplier
from ..json_types import JsonObject
from ..parsing import clean_text
from .base import EntityValidator

_NAME_LIMIT = 100
_CATEGORY_LIMIT = 50


class PackingItemValidator(EntityValidator):
    entity = "packing_item"
    fields = ("name", "category", "is_shared", "is_checked")
    prompt_hint = (
        "name, category, is_shared (true or false), is_checked (true or false)"
    )

    def tidy(self, data: JsonObject) -> JsonObject:
        tidied = dict(data)
        for field, limit in (("name", _NAME_LIMIT), ("category", _CATEGORY_LIMIT)):
            if field in tidied:
                tidied[field] = clean_text(tidied[field], limit)
        return tidied

    def defaults(self, data: JsonObject) -> JsonObject:
        return {**PackingItemChangeSetApplier.create_defaults, **data}

    def check_create(self, data: JsonObject) -> JsonObject | None:
        return data if data["name"] and data["category"] else None

from ..json_types import JsonObject
from ..parsing import clean_text
from .base import EntityValidator


class PackingItemValidator(EntityValidator):
    entity = "packing_item"
    fields = ("name", "category", "is_shared", "is_checked")
    prompt_hint = (
        "name, category, is_shared (true or false), is_checked (true or false)"
    )

    def tidy(self, data: JsonObject) -> JsonObject:
        tidied = dict(data)
        for field in ("name", "category"):
            if field in tidied:
                tidied[field] = clean_text(tidied[field])
        return tidied

    def check_create(self, data: JsonObject) -> JsonObject | None:
        return data if data["name"] else None

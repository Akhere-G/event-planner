from ..describers.base import EntityDescription
from ..json_types import JsonObject
from ..parsing import clean_text, parse_date
from .base import EntityValidator
from .dates import dates_in_order

_LIMIT = 255


class AccommodationValidator(EntityValidator):
    entity = "accommodation"
    fields = ("name", "address", "description", "start_date", "end_date")
    create_required = ("name", "start_date", "end_date")
    prompt_hint = "name, address, description, start_date, end_date (YYYY-MM-DD)"

    def tidy(self, data: JsonObject) -> JsonObject:
        tidied = dict(data)
        for field in ("name", "description"):
            if field in tidied:
                tidied[field] = clean_text(tidied[field], _LIMIT)
        return tidied

    def check_create(self, data: JsonObject) -> JsonObject | None:
        start, end = parse_date(data["start_date"]), parse_date(data["end_date"])
        if not data["name"] or start is None or end is None or end < start:
            return None
        return self._located(data, str(data["name"]), "lodging")

    def check_edit(
        self, current: EntityDescription, data: JsonObject
    ) -> JsonObject | None:
        if "name" in data and not data["name"]:
            return None
        if not dates_in_order(current, data, "start_date", "end_date"):
            return None
        return self._relocated(current, data, "lodging")

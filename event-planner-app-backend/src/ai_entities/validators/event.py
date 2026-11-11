from datetime import datetime

from ...services.flight_context import overlaps_any
from ...utils.trip_time import trip_local_to_utc
from ..describers.base import EntityDescription
from ..json_types import JsonObject
from ..parsing import clean_text, parse_local_datetime
from .base import EntityValidator

_NAME_LIMIT = 100
_DESCRIPTION_LIMIT = 100
_CATEGORY_LIMIT = 10


class EventValidator(EntityValidator):
    """Times are the trip's wall-clock times in, UTC out."""

    entity = "event"
    fields = ("name", "description", "category", "start_at", "end_at", "address")
    create_required = ("name", "start_at", "end_at")
    prompt_hint = (
        "name, description, category (max 10 characters), start_at, end_at, "
        "address (full street address)"
    )

    def tidy(self, data: JsonObject) -> JsonObject:
        tidied = dict(data)
        for field, limit in (
            ("name", _NAME_LIMIT),
            ("description", _DESCRIPTION_LIMIT),
            ("category", _CATEGORY_LIMIT),
        ):
            if field in tidied:
                tidied[field] = clean_text(tidied[field], limit)
        return tidied

    def check_create(self, data: JsonObject) -> JsonObject | None:
        if not data["name"]:
            return None
        timed = self._with_utc_times(data)
        if timed is None:
            return None
        return self._located(timed, str(timed["name"]))

    def check_edit(
        self, current: EntityDescription, data: JsonObject
    ) -> JsonObject | None:
        if "name" in data and not data["name"]:
            return None
        timed = data
        if "start_at" in data or "end_at" in data:
            timed = self._with_utc_times(data)
        return None if timed is None else self._relocated(current, timed)

    def _with_utc_times(self, data: JsonObject) -> JsonObject | None:
        start = parse_local_datetime(data.get("start_at"))
        end = parse_local_datetime(data.get("end_at"))
        if start is None or end is None or not self._allows(start, end):
            return None
        return {
            **data,
            "start_at": trip_local_to_utc(start, self.context.timezone).isoformat(),
            "end_at": trip_local_to_utc(end, self.context.timezone).isoformat(),
        }

    def _allows(self, start: datetime, end: datetime) -> bool:
        rules = self.context.time_rules
        if end <= start or overlaps_any(self.context.flights, start, end):
            return False
        if rules.days is not None and not (
            start.date() == end.date() and start.date() in rules.days
        ):
            return False
        if rules.earliest and start.time() < rules.earliest:
            return False
        return not (rules.latest and end.time() > rules.latest)

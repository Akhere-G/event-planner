from datetime import date

from ..describers.base import EntityDescription
from ..json_types import JsonObject, JsonValue
from ..parsing import parse_date


def _date_or_current(
    data: JsonObject, current: EntityDescription, field: str
) -> date | None:
    value: JsonValue = data[field] if field in data else current.values[field]
    return parse_date(value)


def dates_in_order(
    current: EntityDescription, data: JsonObject, start_field: str, end_field: str
) -> bool:
    """Whether the dates, with the saved ones filling any the data leaves out, run."""
    start = _date_or_current(data, current, start_field)
    end = _date_or_current(data, current, end_field)
    return start is not None and end is not None and start <= end

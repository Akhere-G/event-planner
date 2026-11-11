from collections.abc import Iterable
from datetime import date, datetime

from .json_types import JsonObject, JsonValue


def as_object(value: JsonValue) -> JsonObject | None:
    return value if isinstance(value, dict) else None


def as_list(value: JsonValue) -> list[JsonValue] | None:
    return value if isinstance(value, list) else None


def as_int(value: JsonValue) -> int | None:
    return value if type(value) is int else None


def clean_text(value: JsonValue, limit: int | None = None) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    return value.strip()[:limit]


def pick(data: JsonObject, fields: Iterable[str]) -> JsonObject:
    picked: JsonObject = {}
    for field in fields:
        if field in data:
            picked[field] = data[field]
    return picked


def parse_date(value: JsonValue) -> date | None:
    if not isinstance(value, str):
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def parse_local_datetime(value: JsonValue) -> datetime | None:
    """A wall-clock time; any offset the model added anyway is ignored."""
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed.replace(tzinfo=None)

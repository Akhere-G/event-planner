from datetime import UTC, date, datetime, time
from zoneinfo import ZoneInfo

from ..client import GoogleEvent


def ensure_utc(value: datetime) -> datetime:
    """Treats naive values, as stored by the database, as UTC."""
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def to_google_time(value: datetime, time_zone: str | None = None) -> GoogleEvent:
    node: GoogleEvent = {"dateTime": ensure_utc(value).isoformat()}
    if time_zone:
        node["timeZone"] = time_zone
    return node


def parse_google_timestamp(value: str) -> datetime:
    return ensure_utc(datetime.fromisoformat(value))


def from_google_time(node: GoogleEvent, default_time_zone: str | None) -> datetime:
    """Reads a Google start or end node; all-day events begin at local midnight."""
    zone = ZoneInfo(node.get("timeZone") or default_time_zone or "UTC")
    if "dateTime" in node:
        parsed = datetime.fromisoformat(node["dateTime"])
        return ensure_utc(parsed if parsed.tzinfo else parsed.replace(tzinfo=zone))

    midnight = datetime.combine(date.fromisoformat(node["date"]), time.min)
    return ensure_utc(midnight.replace(tzinfo=zone))

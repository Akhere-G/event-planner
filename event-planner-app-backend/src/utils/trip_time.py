from datetime import UTC, datetime
from zoneinfo import ZoneInfo


def _trip_zone(timezone_name: str | None) -> ZoneInfo:
    return ZoneInfo(timezone_name or "UTC")


def to_trip_local(value: datetime, timezone_name: str | None) -> datetime:
    """Convert a stored (UTC) datetime to naive wall-clock time in the trip's zone."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(_trip_zone(timezone_name)).replace(tzinfo=None)


def trip_local_to_utc(value: str | datetime, timezone_name: str | None) -> datetime:
    """Treat an AI-provided time as wall-clock time in the trip's zone and return UTC.

    Any offset the model adds anyway is ignored, because the prompt asks for local time.
    """
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace("Z", "+00:00"))
    local = value.replace(tzinfo=_trip_zone(timezone_name))
    return local.astimezone(UTC)

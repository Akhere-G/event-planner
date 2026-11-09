from datetime import UTC, datetime


def utcnow() -> datetime:
    """Naive UTC "now", matching how DateTime columns are stored."""
    return datetime.now(UTC).replace(tzinfo=None)

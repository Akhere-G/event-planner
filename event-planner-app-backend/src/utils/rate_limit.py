from collections.abc import Callable

from flask import session
from flask_limiter.util import get_remote_address


def get_user_or_ip():
    user_id = session.get("user_id")

    if user_id:
        return f"user:{user_id}"

    return f"ip:{get_remote_address()}"


def _limit_by_login(logged_in: str, anonymous: str) -> Callable[[], str]:
    """A callable limit, as flask-limiter evaluates it per request."""

    def limit() -> str:
        return logged_in if session.get("user_id") else anonymous

    return limit


# Whole-trip generation is costly, so anonymous users get a tighter limit.
ai_generation_limit = _limit_by_login("10 per hour", "3 per hour")

# Each builder turn is a model call, and the last one plans the whole trip.
trip_builder_hourly_limit = _limit_by_login("30 per hour", "10 per hour")
trip_builder_daily_limit = _limit_by_login("100 per day", "20 per day")

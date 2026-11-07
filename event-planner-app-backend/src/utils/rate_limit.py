from flask import session
from flask_limiter.util import get_remote_address


def get_user_or_ip():
    user_id = session.get("user_id")

    if user_id:
        return f"user:{user_id}"

    return f"ip:{get_remote_address()}"


def ai_generation_limit():
    """Whole-trip generation is costly, so anonymous users get a tighter limit."""
    return "10 per hour" if session.get("user_id") else "3 per hour"

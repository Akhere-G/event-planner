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


DEFAULT_AI_TASK_LIMIT = "10 per minute"


def _requested_task_type() -> str | None:
    from flask import request

    return (request.view_args or {}).get("task_type")


def ai_task_limit() -> str:
    from ..ai_tasks.registry import get_handler
    from ..exceptions import UnknownAiTaskTypeError

    task_type = _requested_task_type()
    try:
        limit = get_handler(task_type or "").rate_limit
    except UnknownAiTaskTypeError:
        return DEFAULT_AI_TASK_LIMIT  # The route then rejects the unknown type.
    return limit() if callable(limit) else limit


def ai_task_scope(endpoint: str) -> str:
    """Counts each task type separately even though they share one route."""
    return f"{endpoint}:{_requested_task_type()}"

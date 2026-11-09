import os
from collections.abc import Callable

from flask import Flask, current_app

from .base import TaskDispatcher
from .cloud_tasks import CloudTasksDispatcher
from .inline import InlineDispatcher
from .settings import CloudTasksSettings
from .thread import LocalThreadDispatcher

EXTENSION_KEY = "ai_task_dispatcher"

_BUILDERS: dict[str, Callable[[Flask], TaskDispatcher]] = {
    "cloud_tasks": lambda app: CloudTasksDispatcher(CloudTasksSettings.from_env()),
    "thread": LocalThreadDispatcher,
    "inline": lambda app: InlineDispatcher(),
}


def default_dispatcher_name(app: Flask) -> str:
    if app.config.get("TESTING"):
        return "inline"
    return "cloud_tasks" if os.getenv("ENVIRONMENT") == "PROD" else "thread"


def get_dispatcher() -> TaskDispatcher:
    """Built on first use, so settings are only needed once something is queued."""
    app = current_app._get_current_object()  # type: ignore[attr-defined]
    if EXTENSION_KEY not in app.extensions:
        name = os.getenv("AI_TASK_DISPATCHER") or default_dispatcher_name(app)
        app.extensions[EXTENSION_KEY] = _BUILDERS[name](app)
    return app.extensions[EXTENSION_KEY]

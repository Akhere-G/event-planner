import os
from collections.abc import Callable, Mapping
from typing import TypeVar

from flask import Flask, current_app

from .base import TaskDispatcher
from .cloud_tasks import CloudTasksDispatcher
from .inline import InlineDispatcher
from .settings import CloudTasksSettings
from .thread import LocalThreadDispatcher

EXTENSION_KEY = "ai_task_dispatcher"

D = TypeVar("D")

_BUILDERS: dict[str, Callable[[Flask], TaskDispatcher]] = {
    "cloud_tasks": lambda app: CloudTasksDispatcher(CloudTasksSettings.from_env()),
    "thread": LocalThreadDispatcher,
    "inline": lambda app: InlineDispatcher(),
}


def default_dispatcher_name(app: Flask) -> str:
    if app.config.get("TESTING"):
        return "inline"
    return "cloud_tasks" if os.getenv("ENVIRONMENT") == "PROD" else "thread"


def get_or_build_dispatcher(
    extension_key: str, env_var: str, builders: Mapping[str, Callable[[Flask], D]]
) -> D:
    """Built on first use, so settings are only needed once something is queued."""
    app = current_app._get_current_object()  # type: ignore[attr-defined]
    if extension_key not in app.extensions:
        name = os.getenv(env_var) or default_dispatcher_name(app)
        app.extensions[extension_key] = builders[name](app)
    return app.extensions[extension_key]


def get_dispatcher() -> TaskDispatcher:
    return get_or_build_dispatcher(EXTENSION_KEY, "AI_TASK_DISPATCHER", _BUILDERS)

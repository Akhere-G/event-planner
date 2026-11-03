import logging
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from flask import Flask, current_app

from ..realtime.change_tracker import EntityChange, register_change_listener
from .connections import google_client_for_user
from .mappers import get_mapper
from .push import push_changes

logger = logging.getLogger(__name__)

# Bounded so a burst of edits queues instead of opening a thread per commit.
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="calendar-sync")


def _run_in_app(app: Flask, task: Callable[..., None], args: tuple[Any, ...]) -> None:
    with app.app_context():
        try:
            task(*args)
        except Exception:
            logger.exception("Background calendar sync task failed")


def run_in_background(task: Callable[..., None], *args: Any) -> None:
    app = current_app._get_current_object()  # type: ignore[attr-defined]
    _executor.submit(_run_in_app, app, task, args)


def queue_push(changes: list[EntityChange]) -> None:
    relevant = [change for change in changes if get_mapper(change.entity)]
    if relevant:
        run_in_background(push_changes, relevant, google_client_for_user)


def register_calendar_sync(testing: bool) -> None:
    """Pushes every committed change to Google; off under test to stay offline."""
    if not testing:
        register_change_listener(queue_push)

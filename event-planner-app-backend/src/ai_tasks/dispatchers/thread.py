import logging
import threading

from flask import Flask

from ...extensions import db
from ..runner import TaskRunner

logger = logging.getLogger(__name__)


class LocalThreadDispatcher:
    """Runs the task on a background thread of this process. For local development only:
    on Cloud Run the CPU is throttled once the response is sent."""

    def __init__(self, app: Flask, runner: TaskRunner | None = None):
        self._app = app
        self._runner = runner or TaskRunner()

    def dispatch(self, task_id: int) -> str | None:
        threading.Thread(
            target=self._run, args=(task_id,), daemon=True, name=f"ai-task-{task_id}"
        ).start()
        return None

    def cancel(self, dispatch_name: str | None) -> None:
        return None  # The runner notices the cancelled row at its next progress report.

    def _run(self, task_id: int) -> None:
        with self._app.app_context():
            try:
                self._runner.run_with_retries(task_id)
            except Exception:
                logger.exception("AI task %s crashed.", task_id)
            finally:
                db.session.remove()

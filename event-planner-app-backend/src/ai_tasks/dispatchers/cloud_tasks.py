from contextlib import suppress
from typing import Any

from google.api_core import exceptions as gcp_exceptions
from google.cloud import tasks_v2

from .http_task import build_http_task
from .settings import CloudTasksSettings


class CloudTasksDispatcher:
    """Queues the task on Cloud Tasks, which calls back into this service over HTTP.

    The callback is an ordinary request, so Cloud Run keeps CPU allocated while it runs.
    """

    def __init__(self, settings: CloudTasksSettings, client: Any | None = None):
        self._settings = settings
        self._client = client or tasks_v2.CloudTasksClient()
        self._queue_path = self._client.queue_path(
            settings.project, settings.location, settings.queue
        )

    def _task_name(self, task_id: int) -> str:
        return f"{self._queue_path}/tasks/ai-task-{task_id}"

    def dispatch(self, task_id: int) -> str | None:
        task = build_http_task(
            self._settings,
            self._settings.run_url(task_id),
            name=self._task_name(task_id),
        )
        with suppress(gcp_exceptions.AlreadyExists):
            self._client.create_task(request={"parent": self._queue_path, "task": task})
        return task.name

    def cancel(self, dispatch_name: str | None) -> None:
        if not dispatch_name:
            return
        with suppress(gcp_exceptions.NotFound):
            self._client.delete_task(name=dispatch_name)

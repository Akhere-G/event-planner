from typing import Any

from google.api_core import exceptions as gcp_exceptions
from google.cloud import tasks_v2
from google.protobuf import duration_pb2

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
        settings = self._settings
        task = tasks_v2.Task(
            name=self._task_name(task_id),
            dispatch_deadline=duration_pb2.Duration(
                seconds=settings.dispatch_deadline_seconds
            ),
            http_request=tasks_v2.HttpRequest(
                http_method=tasks_v2.HttpMethod.POST,
                url=settings.run_url(task_id),
                oidc_token=tasks_v2.OidcToken(
                    service_account_email=settings.service_account_email,
                    audience=settings.base_url,
                ),
            ),
        )
        try:
            self._client.create_task(request={"parent": self._queue_path, "task": task})
        except gcp_exceptions.AlreadyExists:
            pass  # Dispatched already (for example, the caller retried).
        return task.name

    def cancel(self, dispatch_name: str | None) -> None:
        if not dispatch_name:
            return
        try:
            self._client.delete_task(name=dispatch_name)
        except gcp_exceptions.NotFound:
            pass  # Already ran or was removed: the runner skips cancelled rows anyway.

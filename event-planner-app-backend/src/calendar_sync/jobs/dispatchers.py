import logging
import threading
from typing import Any, Protocol

from flask import Flask
from google.cloud import tasks_v2

from ...ai_tasks.dispatchers.factory import get_or_build_dispatcher
from ...ai_tasks.dispatchers.http_task import build_http_task
from ...ai_tasks.dispatchers.settings import CloudTasksSettings
from ...extensions import db
from ..connections import google_client_for_user
from .base import CalendarJob

logger = logging.getLogger(__name__)

EXTENSION_KEY = "calendar_job_dispatcher"
JOB_ROUTE = "/api/internal/calendar-sync/jobs"


class JobDispatcher(Protocol):
    def dispatch(self, job: CalendarJob) -> None:
        """Hand the job over for execution."""


def run_job(job: CalendarJob) -> None:
    job.run(google_client_for_user)


class InlineJobDispatcher:
    def dispatch(self, job: CalendarJob) -> None:
        run_job(job)


class LocalThreadJobDispatcher:
    """Runs the job on a background thread. For local development only: on Cloud
    Run the CPU is throttled once the response is sent."""

    def __init__(self, app: Flask):
        self._app = app

    def dispatch(self, job: CalendarJob) -> None:
        threading.Thread(
            target=self._run, args=(job,), daemon=True, name=job.job_type
        ).start()

    def _run(self, job: CalendarJob) -> None:
        with self._app.app_context():
            try:
                run_job(job)
            except Exception:
                logger.exception("Calendar job %s crashed.", job.job_type)
            finally:
                db.session.remove()


class CloudTasksJobDispatcher:
    """Queues the job on Cloud Tasks, which calls back into this service over HTTP."""

    def __init__(self, settings: CloudTasksSettings, client: Any | None = None):
        self._settings = settings
        self._client = client or tasks_v2.CloudTasksClient()
        self._queue_path = self._client.queue_path(
            settings.project, settings.location, settings.queue
        )

    def dispatch(self, job: CalendarJob) -> None:
        url = f"{self._settings.base_url}{JOB_ROUTE}/{job.job_type}"
        task = build_http_task(self._settings, url, payload=job.to_payload())
        self._client.create_task(request={"parent": self._queue_path, "task": task})


_BUILDERS = {
    "cloud_tasks": lambda app: CloudTasksJobDispatcher(CloudTasksSettings.from_env()),
    "thread": LocalThreadJobDispatcher,
    "inline": lambda app: InlineJobDispatcher(),
}


def get_job_dispatcher() -> JobDispatcher:
    return get_or_build_dispatcher(EXTENSION_KEY, "CALENDAR_JOB_DISPATCHER", _BUILDERS)

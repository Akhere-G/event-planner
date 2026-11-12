import json
from unittest.mock import MagicMock

import pytest
from src.ai_tasks.dispatchers.settings import CloudTasksSettings
from src.calendar_sync.change_listener import queue_push
from src.calendar_sync.jobs import dispatch_job, get_job_class
from src.calendar_sync.jobs import dispatchers
from src.calendar_sync.jobs.calendar_jobs import (
    BootstrapCalendarJob,
    PullCalendarJob,
    PushChangesJob,
    ReconcileCalendarJob,
)
from src.calendar_sync.scheduled import run_scheduled_sync
from src.exceptions import UnknownCalendarJobTypeError
from src.realtime import EntityChange

from .fakes import FakeCalendarClient, make_trip_calendar

SETTINGS = CloudTasksSettings(
    project="proj",
    location="europe-west2",
    queue="ai-tasks",
    service_account_email="tasks@proj.iam.gserviceaccount.com",
    base_url="https://app.example.com",
)


class RecordingDispatcher:
    def __init__(self):
        self.jobs = []

    def dispatch(self, job):
        self.jobs.append(job)


@pytest.fixture
def recorder(app):
    recording = RecordingDispatcher()
    app.extensions[dispatchers.EXTENSION_KEY] = recording
    yield recording
    app.extensions.pop(dispatchers.EXTENSION_KEY)


@pytest.mark.parametrize(
    "job",
    [
        PushChangesJob(
            [EntityChange(1, "event", 2, False), EntityChange(1, "flight", 3, True)]
        ),
        PullCalendarJob(4),
        BootstrapCalendarJob(5),
        ReconcileCalendarJob(6),
    ],
)
def test_a_job_survives_a_round_trip_through_its_payload(job):
    payload = json.loads(json.dumps(job.to_payload()))

    assert type(job).from_payload(payload) == job


def test_jobs_are_found_by_type():
    assert get_job_class("pull-calendar") is PullCalendarJob
    with pytest.raises(UnknownCalendarJobTypeError):
        get_job_class("nope")


def test_the_cloud_tasks_dispatcher_posts_the_job_back_with_its_payload():
    client = MagicMock()
    client.queue_path.return_value = "projects/proj/locations/l/queues/ai-tasks"

    dispatchers.CloudTasksJobDispatcher(SETTINGS, client).dispatch(PullCalendarJob(9))

    request = client.create_task.call_args.kwargs["request"]
    http_request = request["task"].http_request
    assert request["parent"] == "projects/proj/locations/l/queues/ai-tasks"
    assert http_request.url == (
        "https://app.example.com/api/internal/calendar-sync/jobs/pull-calendar"
    )
    assert json.loads(http_request.body) == {"trip_calendar_id": 9}
    assert http_request.oidc_token.audience == "https://app.example.com"


def test_the_inline_dispatcher_runs_the_job_with_real_clients(monkeypatch):
    job = MagicMock()
    ran = []
    monkeypatch.setattr(dispatchers, "run_job", ran.append)

    dispatchers.InlineJobDispatcher().dispatch(job)

    assert ran == [job]


def test_running_a_job_gives_it_the_google_client_factory():
    job = MagicMock()

    dispatchers.run_job(job)

    job.run.assert_called_once_with(dispatchers.google_client_for_user)


def test_tests_dispatch_inline_by_default(app, monkeypatch):
    monkeypatch.setitem(app.config, "TESTING", True)
    app.extensions.pop(dispatchers.EXTENSION_KEY, None)
    with app.app_context():
        assert isinstance(
            dispatchers.get_job_dispatcher(), dispatchers.InlineJobDispatcher
        )
    app.extensions.pop(dispatchers.EXTENSION_KEY)


def test_committed_event_and_flight_changes_are_queued_together(recorder):
    changes = [
        EntityChange(1, "event", 2, False),
        EntityChange(1, "expense", 3, False),
        EntityChange(1, "flight", 4, False),
    ]

    queue_push(changes)

    assert recorder.jobs == [PushChangesJob([changes[0], changes[2]])]


def test_changes_nothing_syncs_are_not_queued(recorder):
    queue_push([EntityChange(1, "expense", 3, False)])

    assert recorder.jobs == []


def test_the_daily_sync_renews_channels_and_queues_every_calendar(
    app, recorder, admin_user, editor_user, itinerary
):
    first = make_trip_calendar(admin_user, itinerary)
    second = make_trip_calendar(editor_user, itinerary)

    result = run_scheduled_sync(lambda _: FakeCalendarClient())

    assert result.channels_renewed == 2
    assert result.calendars_queued == 2
    assert recorder.jobs == [
        ReconcileCalendarJob(first.id),
        ReconcileCalendarJob(second.id),
    ]


def test_dispatching_hands_the_job_to_the_configured_dispatcher(recorder):
    dispatch_job(PullCalendarJob(1))

    assert recorder.jobs == [PullCalendarJob(1)]

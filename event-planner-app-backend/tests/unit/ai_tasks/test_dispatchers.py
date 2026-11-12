import json
from unittest.mock import MagicMock

import pytest
from google.api_core import exceptions as gcp_exceptions
from src.ai_tasks.dispatchers.cloud_tasks import CloudTasksDispatcher
from src.ai_tasks.dispatchers.factory import (
    EXTENSION_KEY,
    default_dispatcher_name,
    get_dispatcher,
)
from src.ai_tasks.dispatchers.http_task import build_http_task
from src.ai_tasks.dispatchers.inline import InlineDispatcher
from src.ai_tasks.dispatchers.settings import CloudTasksSettings
from src.ai_tasks.runner import RunOutcome

SETTINGS = CloudTasksSettings(
    project="proj",
    location="europe-west2",
    queue="ai-tasks",
    service_account_email="tasks@proj.iam.gserviceaccount.com",
    base_url="https://app.example.com",
)


@pytest.fixture
def client():
    fake = MagicMock()
    fake.queue_path.return_value = (
        "projects/proj/locations/europe-west2/queues/ai-tasks"
    )
    return fake


def test_task_posts_back_to_the_internal_run_route_with_an_oidc_token(client):
    name = CloudTasksDispatcher(SETTINGS, client).dispatch(42)

    task = client.create_task.call_args.kwargs["request"]["task"]
    assert (
        name == "projects/proj/locations/europe-west2/queues/ai-tasks/tasks/ai-task-42"
    )
    assert (
        task.http_request.url == "https://app.example.com/api/internal/ai-tasks/42/run"
    )
    assert (
        task.http_request.oidc_token.service_account_email
        == SETTINGS.service_account_email
    )
    assert task.http_request.oidc_token.audience == "https://app.example.com"
    assert task.dispatch_deadline.seconds == 900


def test_a_task_can_carry_a_json_body_and_be_unnamed():
    task = build_http_task(SETTINGS, "https://app.example.com/hook", payload={"a": 1})

    assert task.name == ""
    assert json.loads(task.http_request.body) == {"a": 1}
    assert task.http_request.headers["Content-Type"] == "application/json"


def test_dispatching_twice_is_harmless(client):
    client.create_task.side_effect = gcp_exceptions.AlreadyExists("exists")

    assert CloudTasksDispatcher(SETTINGS, client).dispatch(42).endswith("ai-task-42")


def test_cancel_deletes_the_queued_task_and_ignores_one_already_gone(client):
    dispatcher = CloudTasksDispatcher(SETTINGS, client)
    dispatcher.cancel("projects/p/tasks/ai-task-1")
    client.delete_task.assert_called_once_with(name="projects/p/tasks/ai-task-1")

    client.delete_task.side_effect = gcp_exceptions.NotFound("gone")
    dispatcher.cancel("projects/p/tasks/ai-task-1")
    dispatcher.cancel(None)


def test_settings_require_every_variable(monkeypatch):
    for name in (
        "GCP_PROJECT",
        "GCP_LOCATION",
        "CLOUD_TASKS_QUEUE",
        "CLOUD_TASKS_SERVICE_ACCOUNT",
        "SERVICE_BASE_URL",
    ):
        monkeypatch.delenv(name, raising=False)

    with pytest.raises(RuntimeError, match="GCP_PROJECT"):
        CloudTasksSettings.from_env()


def test_settings_read_from_the_environment(monkeypatch):
    monkeypatch.setenv("GCP_PROJECT", "proj")
    monkeypatch.setenv("GCP_LOCATION", "europe-west2")
    monkeypatch.setenv("CLOUD_TASKS_QUEUE", "ai-tasks")
    monkeypatch.setenv("CLOUD_TASKS_SERVICE_ACCOUNT", "sa@proj")
    monkeypatch.setenv("SERVICE_BASE_URL", "https://app.example.com/")

    assert CloudTasksSettings.from_env().run_url(7) == (
        "https://app.example.com/api/internal/ai-tasks/7/run"
    )


def test_inline_dispatcher_runs_the_task_to_completion():
    runner = MagicMock()
    runner.run_with_retries.return_value = RunOutcome.FINISHED

    assert InlineDispatcher(runner).dispatch(5) is None
    assert runner.run_with_retries.call_args.args == (5,)


def test_tests_use_the_inline_dispatcher_by_default(app):
    assert default_dispatcher_name(app) == "inline"
    with app.app_context():
        app.extensions.pop(EXTENSION_KEY, None)
        assert isinstance(get_dispatcher(), InlineDispatcher)


@pytest.mark.parametrize(
    "environment, expected", [("PROD", "cloud_tasks"), ("DEV", "thread")]
)
def test_outside_tests_production_uses_cloud_tasks_and_dev_a_thread(
    app, monkeypatch, environment, expected
):
    monkeypatch.setenv("ENVIRONMENT", environment)
    app.config["TESTING"] = False

    assert default_dispatcher_name(app) == expected

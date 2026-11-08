import pytest
from src.ai_tasks.runner import RunOutcome
from src.middleware import cloud_tasks_auth
from src.routes import internal_task_routes

AUDIENCE = "https://planner.example.com"
QUEUE_ACCOUNT = "queue@project.iam.gserviceaccount.com"


@pytest.fixture(autouse=True)
def configured(monkeypatch):
    monkeypatch.setenv("SERVICE_BASE_URL", AUDIENCE + "/")
    monkeypatch.setenv("CLOUD_TASKS_SERVICE_ACCOUNT", QUEUE_ACCOUNT)


@pytest.fixture
def claims(monkeypatch):
    """Make token verification return these claims (or raise when None)."""
    state = {"value": {"email": QUEUE_ACCOUNT, "email_verified": True}, "audience": None}

    def verify(token, audience):
        state["audience"] = audience
        if state["value"] is None:
            raise ValueError("bad token")
        return state["value"]

    monkeypatch.setattr(cloud_tasks_auth, "verify_google_token", verify)
    return state


@pytest.fixture
def runner(monkeypatch):
    class Runner:
        outcome = RunOutcome.FINISHED
        ran = []

        def run(self, task_id):
            self.ran.append(task_id)
            return self.outcome

    instance = Runner()
    instance.ran = []
    monkeypatch.setattr(internal_task_routes, "TaskRunner", lambda: instance)
    return instance


def call(client, token="Bearer good"):
    headers = {"Authorization": token} if token else {}
    return client.post("/api/internal/ai-tasks/7/run", headers=headers)


def test_runs_the_task_for_the_queue(client, claims, runner):
    response = call(client)

    assert response.status_code == 200
    assert runner.ran == [7]
    assert claims["audience"] == AUDIENCE


def test_transient_failure_asks_the_queue_to_retry(client, claims, runner):
    runner.outcome = RunOutcome.RETRY

    assert call(client).status_code == 503


def test_duplicate_delivery_is_acknowledged(client, claims, runner):
    runner.outcome = RunOutcome.SKIPPED

    assert call(client).status_code == 200


def test_missing_token_is_rejected(client, claims, runner):
    assert call(client, token=None).status_code == 401
    assert runner.ran == []


def test_invalid_token_is_rejected(client, claims, runner):
    claims["value"] = None

    assert call(client).status_code == 401
    assert runner.ran == []


def test_other_service_accounts_are_refused(client, claims, runner):
    claims["value"] = {"email": "someone@else.com", "email_verified": True}

    assert call(client).status_code == 403
    assert runner.ran == []


def test_unverified_email_is_refused(client, claims, runner):
    claims["value"] = {"email": QUEUE_ACCOUNT, "email_verified": False}

    assert call(client).status_code == 403


def test_closed_when_not_configured(client, claims, runner, monkeypatch):
    monkeypatch.delenv("CLOUD_TASKS_SERVICE_ACCOUNT")

    assert call(client).status_code == 401

import pytest
from src.middleware import cloud_tasks_auth
from tests.cloud_tasks import QUEUE_ACCOUNT, QUEUE_AUDIENCE


@pytest.fixture
def cloud_tasks_env(monkeypatch):
    monkeypatch.setenv("SERVICE_BASE_URL", QUEUE_AUDIENCE + "/")
    monkeypatch.setenv("CLOUD_TASKS_SERVICE_ACCOUNT", QUEUE_ACCOUNT)


@pytest.fixture
def claims(monkeypatch, cloud_tasks_env):
    """The verified token claims the next internal request will present."""
    state = {
        "value": {"email": QUEUE_ACCOUNT, "email_verified": True},
        "audience": None,
    }

    def verify(token, audience):
        state["audience"] = audience
        if state["value"] is None:
            raise ValueError("bad token")
        return state["value"]

    monkeypatch.setattr(cloud_tasks_auth, "verify_google_token", verify)
    return state

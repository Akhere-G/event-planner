from datetime import timedelta

import pytest
from marshmallow import Schema
from src.ai_tasks import registry
from src.ai_tasks.handler import AiTaskHandler
from src.ai_tasks.runner import LEASE, RunOutcome, TaskRunner
from src.exceptions import AIProviderError, AIResponseError
from src.extensions import db
from src.models import AiTask, AiTaskStatus
from src.utils.clock import utcnow
from tests.factories import AiTaskFactory, EventFactory


class _Params(Schema):
    pass


class Behaviour:
    """What the dummy handler does on each call, popped in order."""

    def __init__(self, *steps):
        self.steps = list(steps)
        self.calls = 0


behaviour = Behaviour()


@pytest.fixture(autouse=True)
def dummy_handler(monkeypatch):
    global behaviour
    behaviour = Behaviour()
    monkeypatch.setattr(registry, "_HANDLERS", {})

    @registry.register
    class Dummy(AiTaskHandler):
        task_type = "optimise_day"
        label = "Optimise day"
        params_schema = _Params

        def run(self, ctx):
            behaviour.calls += 1
            ctx.progress("Working", 1, 2)
            step = behaviour.steps.pop(0)
            if isinstance(step, Exception):
                raise step
            return step


class FakeNotifier:
    def __init__(self):
        self.events = []

    def status_changed(self, task):
        self.events.append(("status", task.status))

    def finished(self, task):
        self.events.append(("finished", task.status))


@pytest.fixture
def notifier():
    return FakeNotifier()


@pytest.fixture
def runner(notifier):
    return TaskRunner(notifier=notifier)


def reload(task) -> AiTask:
    db.session.expire_all()
    return db.session.get(AiTask, task.id)


def test_successful_run_stores_ops_with_a_snapshot_and_notifies(
    runner, notifier, itinerary
):
    event = EventFactory(itinerary=itinerary)
    task = AiTaskFactory(itinerary=itinerary)
    behaviour.steps = [
        [{"op": "update", "entity": "event", "id": event.id, "data": {}}]
    ]

    outcome = runner.run(task.id)

    stored = reload(task)
    assert outcome is RunOutcome.FINISHED
    assert stored.status == AiTaskStatus.READY.value
    assert stored.attempts == 1
    assert stored.result_ops[0]["base"]["updated_at"]
    assert stored.expires_at > utcnow() + timedelta(days=6)
    assert notifier.events[-1] == ("finished", "ready")


def test_no_ops_ends_empty_without_an_expiry(runner, notifier, itinerary):
    task = AiTaskFactory(itinerary=itinerary)
    behaviour.steps = [[]]

    runner.run(task.id)

    stored = reload(task)
    assert stored.status == AiTaskStatus.EMPTY.value
    assert stored.expires_at is None
    assert notifier.events[-1] == ("finished", "empty")


def test_provider_error_requeues_while_attempts_remain(runner, itinerary):
    task = AiTaskFactory(itinerary=itinerary)
    behaviour.steps = [AIProviderError(), [{"op": "create", "entity": "event", "data": {}}]]

    first = runner.run(task.id)
    assert first is RunOutcome.RETRY
    assert reload(task).status == AiTaskStatus.QUEUED.value

    assert runner.run(task.id) is RunOutcome.FINISHED
    assert reload(task).attempts == 2


def test_provider_error_on_the_last_attempt_fails_the_task(
    runner, notifier, itinerary
):
    task = AiTaskFactory(itinerary=itinerary, attempts=2)
    behaviour.steps = [AIProviderError()]

    outcome = runner.run(task.id)

    stored = reload(task)
    assert outcome is RunOutcome.FINISHED
    assert stored.status == AiTaskStatus.FAILED.value
    assert "unavailable" in stored.error_message
    assert notifier.events[-1] == ("finished", "failed")


def test_unusable_ai_output_fails_without_retrying(runner, itinerary):
    task = AiTaskFactory(itinerary=itinerary)
    behaviour.steps = [AIResponseError()]

    runner.run(task.id)

    stored = reload(task)
    assert stored.status == AiTaskStatus.FAILED.value
    assert stored.attempts == 1


def test_unexpected_error_fails_with_a_generic_message(runner, itinerary):
    task = AiTaskFactory(itinerary=itinerary)
    behaviour.steps = [KeyError("secret internals")]

    runner.run(task.id)

    stored = reload(task)
    assert stored.status == AiTaskStatus.FAILED.value
    assert "secret" not in stored.error_message


def test_duplicate_delivery_while_running_is_skipped(runner, itinerary):
    task = AiTaskFactory(
        itinerary=itinerary, status="running", heartbeat_at=utcnow()
    )

    assert runner.run(task.id) is RunOutcome.SKIPPED
    assert behaviour.calls == 0


def test_a_task_whose_lease_expired_is_taken_over(runner, itinerary):
    task = AiTaskFactory(
        itinerary=itinerary,
        status="running",
        attempts=1,
        heartbeat_at=utcnow() - LEASE - timedelta(seconds=1),
    )
    behaviour.steps = [[{"op": "create", "entity": "event", "data": {}}]]

    assert runner.run(task.id) is RunOutcome.FINISHED
    assert reload(task).attempts == 2


def test_cancelled_task_is_never_run_or_overwritten(runner, itinerary):
    task = AiTaskFactory(itinerary=itinerary, status="cancelled")

    assert runner.run(task.id) is RunOutcome.SKIPPED
    assert reload(task).status == AiTaskStatus.CANCELLED.value


def test_cancelling_mid_run_stops_at_the_next_progress_report(
    runner, itinerary, monkeypatch
):
    task = AiTaskFactory(itinerary=itinerary)

    def cancelled_before_reporting(self, ctx):
        db.session.execute(
            db.update(AiTask)
            .where(AiTask.id == task.id)
            .values(status=AiTaskStatus.CANCELLED.value)
        )
        db.session.commit()
        ctx.progress("Too late")
        return [{"op": "create", "entity": "event", "data": {}}]

    handler = registry.get_handler("optimise_day")
    monkeypatch.setattr(type(handler), "run", cancelled_before_reporting)

    assert runner.run(task.id) is RunOutcome.SKIPPED
    stored = reload(task)
    assert stored.status == AiTaskStatus.CANCELLED.value
    assert stored.result_ops is None


def test_run_with_retries_keeps_going_until_the_task_settles(runner, itinerary):
    task = AiTaskFactory(itinerary=itinerary)
    behaviour.steps = [AIProviderError(), AIProviderError(), []]
    sleeps = []

    outcome = runner.run_with_retries(task.id, sleep=sleeps.append)

    assert outcome is RunOutcome.FINISHED
    assert len(sleeps) == 2
    assert reload(task).status == AiTaskStatus.EMPTY.value

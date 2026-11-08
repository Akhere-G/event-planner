from unittest.mock import patch

import pytest
from marshmallow import Schema
from sqlalchemy import select
from src.ai_tasks import registry
from src.ai_tasks.handlers.base import AiTaskHandler
from src.extensions import db
from src.ai_tasks.notifier import TaskNotifier, task_event_payload
from src.models import Notification
from src.realtime.connections import UserConnectionStore
from src.realtime.rooms import AI_TASK_EVENT, trip_room, user_room
from tests.factories import AiTaskFactory


class _Params(Schema):
    pass


@pytest.fixture(autouse=True)
def dummy_handler(monkeypatch):
    monkeypatch.setattr(registry, "_HANDLERS", {})

    @registry.register
    class Dummy(AiTaskHandler):
        task_type = "optimise_day"
        label = "Optimise day"
        params_schema = _Params

        def run(self, ctx):
            return []


def stored_notifications(user_id=None):
    stmt = select(Notification)
    if user_id is not None:
        stmt = stmt.where(Notification.user_id == user_id)
    return db.session.execute(stmt).scalars().all()


class Recorder:
    def __init__(self):
        self.calls = []

    def __call__(self, event, payload, room):
        self.calls.append((event, payload, room))


def make_task(admin_user, itinerary, status, **extra):
    return AiTaskFactory(
        itinerary=itinerary,
        created_by_id=admin_user.id,
        status=status,
        **extra,
    )


def notified(task, connections=None):
    emit = Recorder()
    with patch(
        "src.ai_tasks.notifier.notification_service.send_web_push"
    ) as push:
        TaskNotifier(emit=emit, connections=connections or UserConnectionStore()).finished(
            task
        )
    return emit, push


def test_payload_never_contains_the_proposed_ops(admin_user, itinerary):
    task = make_task(admin_user, itinerary, "ready", result_ops=[{"op": "create"}])

    assert "result_ops" not in task_event_payload(task)
    assert "ops" not in task_event_payload(task)


def test_ready_task_stores_notification_and_emits_to_the_requester(
    admin_user, itinerary
):
    task = make_task(admin_user, itinerary, "ready", result_ops=[{}, {}])

    emit, _ = notified(task)

    [stored] = stored_notifications(admin_user.id)
    assert stored.link_url == f"/trips/{itinerary.id}?aiTask={task.id}"
    assert "2 changes" in stored.message
    assert emit.calls[0][0] == AI_TASK_EVENT
    assert emit.calls[0][2] == user_room(admin_user.id)


def test_push_is_sent_only_when_the_user_has_no_open_connection(
    admin_user, itinerary
):
    task = make_task(admin_user, itinerary, "ready", result_ops=[{}])

    _, push = notified(task)
    push.assert_called_once()

    online = UserConnectionStore()
    online.touch(admin_user.id, "sid")
    _, push = notified(task, online)
    push.assert_not_called()


def test_empty_result_gets_a_notification_but_never_a_push(admin_user, itinerary):
    task = make_task(admin_user, itinerary, "empty")

    _, push = notified(task)

    assert len(stored_notifications(admin_user.id)) == 1
    push.assert_not_called()


def test_failed_task_links_to_the_task_so_it_can_be_retried(admin_user, itinerary):
    task = make_task(admin_user, itinerary, "failed")

    notified(task)

    [stored] = stored_notifications(admin_user.id)
    assert stored.title == "AI task failed"
    assert stored.link_url.endswith(f"?aiTask={task.id}")


def test_anonymous_requester_hears_on_the_trip_room_only(itinerary):
    task = AiTaskFactory(itinerary=itinerary, created_by_id=None, status="ready")
    before = len(stored_notifications())

    emit, push = notified(task)

    assert emit.calls[0][2] == trip_room(itinerary.id)
    assert len(stored_notifications()) == before
    push.assert_not_called()

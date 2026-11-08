from src.extensions import db
from src.models import ACTIVE_STATUSES, FINISHED_STATUSES, AiTaskStatus
from tests.factories import AiTaskFactory


def test_new_task_defaults_to_queued_with_no_requester(itinerary):
    task = AiTaskFactory(itinerary=itinerary)

    assert task.status == AiTaskStatus.QUEUED.value
    assert task.attempts == 0
    assert task.created_by_id is None
    assert task.result_ops is None
    assert task.created_at is not None


def test_task_stores_json_params_and_ops(itinerary):
    ops = [{"op": "create", "entity": "event", "data": {"name": "Louvre"}}]
    task = AiTaskFactory(
        itinerary=itinerary, params={"dates": ["2026-08-01"]}, result_ops=ops
    )

    db.session.expire(task)

    assert task.params == {"dates": ["2026-08-01"]}
    assert task.result_ops == ops


def test_every_status_is_either_active_or_finished_or_ready():
    covered = set(ACTIVE_STATUSES) | set(FINISHED_STATUSES) | {AiTaskStatus.READY}
    assert covered == set(AiTaskStatus)

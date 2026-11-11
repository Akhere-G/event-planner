from src.ai_tasks.runner import PROPOSAL_LIFETIME
from src.models import AiTaskStatus
from src.services import ai_task_service

OPS = [{"op": "delete", "entity": "event", "id": 1, "data": {}, "reason": None}]


def test_create_proposal_stores_a_ready_task_with_its_ops(itinerary, editor_user):
    task = ai_task_service.create_proposal(
        itinerary.id, "edit_trip", {"message": "Drop it"}, OPS, editor_user.id
    )

    assert task.status == AiTaskStatus.READY.value
    assert task.type == "edit_trip"
    assert task.params == {"message": "Drop it"}
    assert task.result_ops == OPS
    assert task.created_by_id == editor_user.id


def test_create_proposal_expires_like_a_background_proposal(itinerary):
    task = ai_task_service.create_proposal(itinerary.id, "edit_trip", {}, OPS, None)

    assert task.expires_at - task.finished_at == PROPOSAL_LIFETIME


def test_an_anonymous_proposal_has_no_requester(itinerary):
    task = ai_task_service.create_proposal(itinerary.id, "edit_trip", {}, OPS, None)

    assert task.created_by_id is None
    assert ai_task_service.list_trip_tasks(itinerary.id, None) == [task]

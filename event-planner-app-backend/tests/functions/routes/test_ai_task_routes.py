from datetime import timedelta

import pytest
from marshmallow import Schema, fields
from sqlalchemy import select
import src.ai_tasks.handlers  # noqa: F401  (registers the real handlers before they are swapped out)
from src.ai_tasks import registry
from src.ai_tasks.handler import AiTaskHandler
from src.extensions import db
from src.models import AiTask, AiTaskStatus, Event
from src.services import ai_task_service
from src.utils.clock import utcnow
from tests.factories import AiTaskFactory, EventFactory, ItineraryFactory


class _Params(Schema):
    dates = fields.List(fields.Date(), required=True)


class _Day(AiTaskHandler):
    task_type = "fake_day"
    label = "Fake day"
    params_schema = _Params

    def conflict_scope(self, params):
        return frozenset(params["dates"])

    def run(self, ctx):
        return []


class RecordingDispatcher:
    def __init__(self):
        self.dispatched = []
        self.cancelled = []

    def dispatch(self, task_id):
        self.dispatched.append(task_id)
        return f"ai-task-{task_id}"

    def cancel(self, name):
        self.cancelled.append(name)


@pytest.fixture(autouse=True)
def fake_handler(monkeypatch):
    monkeypatch.setattr(registry, "_HANDLERS", {})
    registry.register(_Day)


@pytest.fixture
def dispatcher(monkeypatch):
    recording = RecordingDispatcher()
    monkeypatch.setattr(ai_task_service, "get_dispatcher", lambda: recording)
    return recording


def url(itinerary, suffix=""):
    return f"/api/itineraries/{itinerary.id}/ai-tasks{suffix}"


def queue(client, itinerary, *dates):
    return client.post(
        url(itinerary, "/fake_day"), json={"dates": list(dates or ["2026-08-01"])}
    )


def make_task(itinerary, user, **fields):
    return AiTaskFactory(
        itinerary=itinerary,
        type="fake_day",
        params={"dates": ["2026-08-01"]},
        created_by_id=user.id,
        **fields,
    )


def ready_task(itinerary, user, ops, **fields):
    return make_task(
        itinerary,
        user,
        status="ready",
        result_ops=ops,
        finished_at=utcnow(),
        expires_at=utcnow() + timedelta(days=7),
        **fields,
    )


def test_editor_queues_a_task(editor_client, editor_user, itinerary, dispatcher):
    response = queue(editor_client, itinerary)

    assert response.status_code == 202
    data = response.get_json()["data"]
    assert data["status"] == "queued"
    assert data["tripId"] == itinerary.id
    task = db.session.get(AiTask, data["id"])
    assert task.created_by_id == editor_user.id
    assert task.cloud_task_name == f"ai-task-{task.id}"
    assert dispatcher.dispatched == [task.id]


def test_viewer_cannot_queue(viewer_client, itinerary, dispatcher):
    assert queue(viewer_client, itinerary).status_code == 403
    assert dispatcher.dispatched == []


def test_non_member_cannot_queue(non_member_client, itinerary, dispatcher):
    assert queue(non_member_client, itinerary).status_code in (401, 403, 404)


def test_unknown_type_is_not_found(editor_client, itinerary, dispatcher):
    response = editor_client.post(url(itinerary, "/nope"), json={})
    assert response.status_code == 404


def test_invalid_params_are_rejected(editor_client, itinerary, dispatcher):
    response = editor_client.post(url(itinerary, "/fake_day"), json={"dates": "x"})
    assert response.status_code == 400
    assert dispatcher.dispatched == []


def test_overlapping_active_task_is_a_conflict(editor_client, itinerary, dispatcher):
    assert (
        queue(editor_client, itinerary, "2026-08-01", "2026-08-02").status_code == 202
    )

    assert queue(editor_client, itinerary, "2026-08-02").status_code == 409
    assert queue(editor_client, itinerary, "2026-08-03").status_code == 202


def test_cap_of_active_tasks_per_user(editor_client, itinerary, dispatcher):
    for day in ("2026-08-01", "2026-08-02", "2026-08-03"):
        assert queue(editor_client, itinerary, day).status_code == 202

    other_trip = ItineraryFactory()
    assert queue(editor_client, other_trip).status_code in (403, 401, 404)
    assert queue(editor_client, itinerary, "2026-08-04").status_code == 429


def test_failed_dispatch_marks_the_task_failed(editor_client, itinerary, monkeypatch):
    class Broken:
        def dispatch(self, task_id):
            raise RuntimeError("queue down")

    monkeypatch.setattr(ai_task_service, "get_dispatcher", Broken)

    response = queue(editor_client, itinerary)

    assert response.status_code == 503
    task = (
        db.session.execute(select(AiTask).where(AiTask.itinerary_id == itinerary.id))
        .scalars()
        .one()
    )
    assert task.status == AiTaskStatus.FAILED.value


def test_old_finished_tasks_are_purged_on_enqueue(
    editor_client, editor_user, itinerary, dispatcher
):
    old = make_task(itinerary, editor_user, status="accepted")
    old.decided_at = utcnow() - timedelta(days=31)
    recent = make_task(itinerary, editor_user, status="accepted")
    recent.decided_at = utcnow() - timedelta(days=2)
    db.session.flush()
    old_id, recent_id = old.id, recent.id

    queue(editor_client, itinerary)
    db.session.expire_all()

    assert db.session.get(AiTask, old_id) is None
    assert db.session.get(AiTask, recent_id) is not None


def test_anonymous_trip_can_queue_with_access_code(client, dispatcher):
    trip = ItineraryFactory(is_anonymous=True, anonymous_access_code="secret")

    response = client.post(
        url(trip, "/fake_day"),
        json={"dates": ["2026-08-01"]},
        headers={"X-Itinerary-Access-Code": "secret"},
    )

    assert response.status_code == 202
    assert (
        db.session.get(AiTask, response.get_json()["data"]["id"]).created_by_id is None
    )


def test_anonymous_cap_is_per_trip(client, dispatcher):
    trip = ItineraryFactory(is_anonymous=True, anonymous_access_code="secret")
    headers = {"X-Itinerary-Access-Code": "secret"}

    for day in ("2026-08-01", "2026-08-02", "2026-08-03"):
        client.post(url(trip, "/fake_day"), json={"dates": [day]}, headers=headers)
    blocked = client.post(
        url(trip, "/fake_day"), json={"dates": ["2026-08-04"]}, headers=headers
    )

    assert blocked.status_code == 429


def test_list_returns_only_my_live_tasks(
    editor_client, editor_user, itinerary, admin_user
):
    mine = make_task(itinerary, editor_user, status="running")
    make_task(itinerary, editor_user, status="accepted")
    make_task(itinerary, admin_user, status="running")

    response = editor_client.get(url(itinerary))

    assert [t["id"] for t in response.get_json()["data"]] == [mine.id]


def test_someone_elses_task_looks_missing(editor_client, itinerary, admin_user):
    task = make_task(itinerary, admin_user, status="ready", result_ops=[])

    assert editor_client.get(url(itinerary, f"/{task.id}")).status_code == 404
    assert editor_client.post(url(itinerary, f"/{task.id}/reject")).status_code == 404


def test_detail_separates_edited_from_deleted_targets(
    editor_client, editor_user, itinerary
):
    edited = EventFactory(itinerary=itinerary)
    ops = [
        {"op": "create", "entity": "event", "data": {"name": "New"}},
        {
            "op": "update",
            "entity": "event",
            "id": edited.id,
            "data": {"name": "Renamed"},
            "base": {"updated_at": "2000-01-01T00:00:00"},
        },
        {
            "op": "delete",
            "entity": "event",
            "id": edited.id + 1000,
            "base": {"updated_at": "2000-01-01T00:00:00"},
        },
    ]
    task = ready_task(itinerary, editor_user, ops)

    data = editor_client.get(url(itinerary, f"/{task.id}")).get_json()["data"]

    assert len(data["ops"]) == 3
    assert data["changedOpIndexes"] == [1]
    assert data["unavailableOpIndexes"] == [2]


def test_expired_proposals_are_marked_on_read(editor_client, editor_user, itinerary):
    task = ready_task(itinerary, editor_user, [])
    task.expires_at = utcnow() - timedelta(minutes=1)
    db.session.flush()

    data = editor_client.get(url(itinerary, f"/{task.id}")).get_json()["data"]

    assert data["status"] == "expired"


def test_abandoned_running_task_with_no_attempts_left_fails(
    editor_client, editor_user, itinerary
):
    task = make_task(
        itinerary,
        editor_user,
        status="running",
        attempts=3,
        heartbeat_at=utcnow() - timedelta(minutes=30),
    )

    data = editor_client.get(url(itinerary, f"/{task.id}")).get_json()["data"]

    assert data["status"] == "failed"


def test_pending_lists_my_ready_proposals_across_trips(
    editor_client, editor_user, itinerary, admin_user
):
    mine = ready_task(itinerary, editor_user, [])
    ready_task(itinerary, admin_user, [])
    make_task(itinerary, editor_user, status="running")
    expired = ready_task(itinerary, editor_user, [])
    expired.expires_at = utcnow() - timedelta(days=1)
    db.session.flush()

    response = editor_client.get("/api/ai-tasks/pending")

    assert [t["id"] for t in response.get_json()["data"]] == [mine.id]


def test_pending_skips_trips_i_can_no_longer_edit(
    viewer_client, viewer_user, itinerary
):
    ready_task(itinerary, viewer_user, [])

    assert viewer_client.get("/api/ai-tasks/pending").get_json()["data"] == []


def test_pending_requires_login(client):
    assert client.get("/api/ai-tasks/pending").status_code == 401


def test_cancel_a_queued_task(editor_client, editor_user, itinerary, dispatcher):
    task = make_task(itinerary, editor_user, cloud_task_name="ai-task-x")

    response = editor_client.post(url(itinerary, f"/{task.id}/cancel"))

    assert response.status_code == 200
    assert response.get_json()["data"]["status"] == "cancelled"
    assert dispatcher.cancelled == ["ai-task-x"]


def test_cannot_cancel_a_finished_task(
    editor_client, editor_user, itinerary, dispatcher
):
    task = ready_task(itinerary, editor_user, [])

    assert editor_client.post(url(itinerary, f"/{task.id}/cancel")).status_code == 409


def test_retry_queues_a_copy_and_dismisses_the_failure(
    editor_client, editor_user, itinerary, dispatcher
):
    failed = make_task(itinerary, editor_user, status="failed", error_message="boom")

    response = editor_client.post(url(itinerary, f"/{failed.id}/retry"))

    assert response.status_code == 202
    new_id = response.get_json()["data"]["id"]
    assert new_id != failed.id
    assert db.session.get(AiTask, new_id).params == failed.params
    assert db.session.get(AiTask, failed.id).status == "rejected"
    assert dispatcher.dispatched == [new_id]


def test_only_failed_tasks_can_be_retried(
    editor_client, editor_user, itinerary, dispatcher
):
    task = ready_task(itinerary, editor_user, [])

    assert editor_client.post(url(itinerary, f"/{task.id}/retry")).status_code == 409


def test_reject_a_proposal(editor_client, editor_user, itinerary):
    task = ready_task(itinerary, editor_user, [])

    response = editor_client.post(url(itinerary, f"/{task.id}/reject"))

    assert response.get_json()["data"]["status"] == "rejected"
    assert editor_client.post(url(itinerary, f"/{task.id}/reject")).status_code == 409


def event_op(name="Dinner"):
    return {
        "op": "create",
        "entity": "event",
        "data": {
            "name": name,
            "address": "1 Rue Cler, Paris",
            "latitude": 48.85,
            "longitude": 2.30,
            "category": "Food",
            "start_at": "2026-08-01T18:00:00Z",
            "end_at": "2026-08-01T20:00:00Z",
        },
    }


def accept(client, itinerary, task, indexes):
    return client.post(
        url(itinerary, f"/{task.id}/accept"), json={"opIndexes": indexes}
    )


def trip_event_names(itinerary):
    names = set()
    events = db.session.execute(
        select(Event).where(Event.itinerary_id == itinerary.id)
    ).scalars()
    for event in events:
        names.add(event.name)
    return names


def test_accept_applies_only_the_chosen_changes(editor_client, editor_user, itinerary):
    task = ready_task(itinerary, editor_user, [event_op("A"), event_op("B")])

    response = accept(editor_client, itinerary, task, [1])

    assert response.status_code == 200
    assert response.get_json()["data"]["applied"]["created"] == 1
    assert trip_event_names(itinerary) == {"B"}
    db.session.expire_all()
    assert task.status == "accepted"
    assert task.decided_at is not None


def test_second_accept_is_a_conflict(editor_client, editor_user, itinerary):
    task = ready_task(itinerary, editor_user, [event_op()])
    accept(editor_client, itinerary, task, [0])

    assert accept(editor_client, itinerary, task, [0]).status_code == 409
    assert len(trip_event_names(itinerary)) == 1


def test_accept_still_applies_a_change_to_an_edited_target(
    editor_client, editor_user, itinerary
):
    edited = EventFactory(itinerary=itinerary)
    stale_update = {
        "op": "update",
        "entity": "event",
        "id": edited.id,
        "data": {"name": "AI name"},
        "base": {"updated_at": "2000-01-01T00:00:00"},
    }
    task = ready_task(itinerary, editor_user, [stale_update, event_op("Fresh")])

    response = accept(editor_client, itinerary, task, [0, 1])

    assert response.status_code == 200
    assert response.get_json()["data"]["skippedUnavailable"] == 0
    assert trip_event_names(itinerary) == {"AI name", "Fresh"}


def test_accept_skips_changes_to_deleted_targets_and_applies_the_rest(
    editor_client, editor_user, itinerary
):
    gone = {
        "op": "delete",
        "entity": "event",
        "id": EventFactory(itinerary=itinerary).id + 1000,
        "base": {"updated_at": "2000-01-01T00:00:00"},
    }
    task = ready_task(itinerary, editor_user, [gone, event_op("Fresh")])

    response = accept(editor_client, itinerary, task, [0, 1])

    assert response.status_code == 200
    assert response.get_json()["data"]["skippedUnavailable"] == 1
    assert "Fresh" in trip_event_names(itinerary)


def test_accept_fails_when_every_chosen_change_targets_something_deleted(
    editor_client, editor_user, itinerary
):
    gone = {
        "op": "delete",
        "entity": "event",
        "id": EventFactory(itinerary=itinerary).id + 1000,
        "base": {"updated_at": "2000-01-01T00:00:00"},
    }
    task = ready_task(itinerary, editor_user, [gone])

    assert accept(editor_client, itinerary, task, [0]).status_code == 400
    db.session.expire_all()
    assert task.status == "ready"


def test_accept_validates_the_indexes(editor_client, editor_user, itinerary):
    task = ready_task(itinerary, editor_user, [event_op()])

    assert accept(editor_client, itinerary, task, [5]).status_code == 400
    assert accept(editor_client, itinerary, task, []).status_code == 400
    assert accept(editor_client, itinerary, task, [-1]).status_code == 400


def test_expired_proposal_cannot_be_accepted(editor_client, editor_user, itinerary):
    task = ready_task(itinerary, editor_user, [event_op()])
    task.expires_at = utcnow() - timedelta(minutes=1)
    db.session.flush()

    assert accept(editor_client, itinerary, task, [0]).status_code in (404, 409)
    assert trip_event_names(itinerary) == set()


def test_viewer_cannot_accept(viewer_client, viewer_user, itinerary):
    task = ready_task(itinerary, viewer_user, [event_op()])

    assert accept(viewer_client, itinerary, task, [0]).status_code == 403


def test_invalid_change_leaves_the_proposal_pending(
    editor_client, editor_user, itinerary
):
    bad = event_op()
    bad["data"]["end_at"] = "2026-08-01T10:00:00Z"  # before it starts
    task = ready_task(itinerary, editor_user, [event_op("Ok"), bad])

    response = accept(editor_client, itinerary, task, [0, 1])

    assert response.status_code >= 400
    assert trip_event_names(itinerary) == set()
    db.session.expire_all()
    assert task.status == "ready"

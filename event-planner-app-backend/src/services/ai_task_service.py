import logging
from datetime import timedelta
from typing import Any

from sqlalchemy import and_, delete, exists, func, select, update

from ..ai_tasks import snapshots
from ..ai_tasks.dispatchers.factory import get_dispatcher
from ..ai_tasks.notifier import TaskNotifier
from ..ai_tasks.registry import get_handler
from ..ai_tasks.runner import LEASE, PROPOSAL_LIFETIME
from ..exceptions import (
    ActiveAiTaskConflictError,
    AiTaskNotFoundError,
    AiTaskQueueError,
    BadRequestError,
    InvalidAiTaskStateError,
    TooManyActiveAiTasksError,
)
from ..extensions import db
from ..models import (
    ACTIVE_STATUSES,
    AiTask,
    AiTaskStatus,
    Itinerary,
    ItineraryUser,
    UserRole,
)
from ..utils.clock import utcnow
from .change_set_service import apply_change_set
from .itineraries_service import get_itinerary

logger = logging.getLogger(__name__)

MAX_ACTIVE_TASKS = 3
FINISHED_RETENTION = timedelta(days=30)

_ACTIVE = [status.value for status in ACTIVE_STATUSES]
_EDIT_ROLES = [UserRole.ADMIN.value, UserRole.EDITOR.value]


def _notifier() -> TaskNotifier:
    return TaskNotifier()


def expire_due_proposals() -> None:
    db.session.execute(
        update(AiTask)
        .where(
            AiTask.status == AiTaskStatus.READY.value,
            AiTask.expires_at < utcnow(),
        )
        .values(status=AiTaskStatus.EXPIRED.value)
    )
    db.session.commit()


def fail_abandoned_tasks() -> None:
    """A running task whose worker vanished and that has no attempts left would
    otherwise sit in "running" for ever."""
    db.session.execute(
        update(AiTask)
        .where(
            AiTask.status == AiTaskStatus.RUNNING.value,
            AiTask.heartbeat_at < utcnow() - LEASE,
            AiTask.attempts >= AiTask.max_attempts,
        )
        .values(
            status=AiTaskStatus.FAILED.value,
            error_message="This task stopped unexpectedly.",
            finished_at=utcnow(),
        )
    )
    db.session.commit()


def purge_old_tasks() -> None:
    finished = func.coalesce(AiTask.decided_at, AiTask.expires_at, AiTask.finished_at)
    db.session.execute(delete(AiTask).where(finished < utcnow() - FINISHED_RETENTION))
    db.session.commit()


def _housekeeping() -> None:
    expire_due_proposals()
    fail_abandoned_tasks()


def _own_tasks(itinerary_id: int, user_id: int | None):
    stmt = select(AiTask).where(AiTask.itinerary_id == itinerary_id)
    if user_id is None:
        return stmt.where(AiTask.created_by_id.is_(None))
    return stmt.where(AiTask.created_by_id == user_id)


def get_task(itinerary_id: int, task_id: int, user_id: int | None) -> AiTask:
    """A task of this trip that the caller requested. Others' tasks look missing."""
    _housekeeping()
    task = db.session.execute(
        _own_tasks(itinerary_id, user_id).where(AiTask.id == task_id)
    ).scalar_one_or_none()
    if task is None:
        raise AiTaskNotFoundError()
    return task


def list_trip_tasks(itinerary_id: int, user_id: int | None) -> list[AiTask]:
    _housekeeping()
    live = [*_ACTIVE, AiTaskStatus.READY.value, AiTaskStatus.FAILED.value]
    stmt = (
        _own_tasks(itinerary_id, user_id)
        .where(AiTask.status.in_(live))
        .order_by(AiTask.created_at)
    )
    return list(db.session.execute(stmt).scalars())


def list_pending_proposals(user_id: int) -> list[AiTask]:
    _housekeeping()
    can_edit = exists().where(
        and_(
            ItineraryUser.itinerary_id == AiTask.itinerary_id,
            ItineraryUser.user_id == user_id,
            ItineraryUser.role.in_(_EDIT_ROLES),
        )
    )
    stmt = (
        select(AiTask)
        .where(
            AiTask.created_by_id == user_id,
            AiTask.status == AiTaskStatus.READY.value,
            can_edit,
        )
        .order_by(AiTask.finished_at)
    )
    return list(db.session.execute(stmt).scalars())


def stale_ops(task: AiTask) -> dict[int, snapshots.Staleness]:
    return snapshots.find_stale(task.itinerary_id, task.result_ops or [])


def _assert_no_conflict(itinerary_id: int, task_type: str, params: dict) -> None:
    handler = get_handler(task_type)
    scope = handler.conflict_scope(params)
    active = db.session.execute(
        select(AiTask).where(
            AiTask.itinerary_id == itinerary_id,
            AiTask.type == task_type,
            AiTask.status.in_(_ACTIVE),
        )
    ).scalars()
    if any(not scope.isdisjoint(handler.conflict_scope(t.params)) for t in active):
        raise ActiveAiTaskConflictError()


def _assert_under_cap(itinerary_id: int, user_id: int | None) -> None:
    if user_id is None:
        scope = and_(
            AiTask.itinerary_id == itinerary_id, AiTask.created_by_id.is_(None)
        )
    else:
        scope = AiTask.created_by_id == user_id
    active = db.session.execute(
        select(func.count())
        .select_from(AiTask)
        .where(scope, AiTask.status.in_(_ACTIVE))
    ).scalar_one()
    if active >= MAX_ACTIVE_TASKS:
        raise TooManyActiveAiTasksError()


def enqueue(
    itinerary_id: int, task_type: str, raw_params: dict[str, Any], user_id: int | None
) -> AiTask:
    handler = get_handler(task_type)
    schema = handler.params_schema()
    params = schema.dump(schema.load(raw_params))
    handler.validate_for_trip(get_itinerary(itinerary_id), params)

    purge_old_tasks()
    _housekeeping()
    # Serialise concurrent requests for this trip so the checks below cannot race.
    db.session.execute(
        select(Itinerary.id).where(Itinerary.id == itinerary_id).with_for_update()
    )
    _assert_no_conflict(itinerary_id, task_type, params)
    _assert_under_cap(itinerary_id, user_id)

    task = AiTask(
        itinerary_id=itinerary_id,
        type=task_type,
        status=AiTaskStatus.QUEUED.value,
        params=params,
        created_by_id=user_id,
        updated_by_id=user_id,
    )
    db.session.add(task)
    db.session.commit()
    _notifier().status_changed(task)
    return _dispatch(task.id)


def create_proposal(
    itinerary_id: int,
    task_type: str,
    params: dict[str, Any],
    ops: list[dict[str, Any]],
    user_id: int | None,
) -> AiTask:
    """Store ops that were produced inside the request as a proposal awaiting a
    decision, so they are accepted, rejected and expired like a background task's."""
    now = utcnow()
    task = AiTask(
        itinerary_id=itinerary_id,
        type=task_type,
        status=AiTaskStatus.READY.value,
        params=params,
        result_ops=ops,
        started_at=now,
        finished_at=now,
        expires_at=now + PROPOSAL_LIFETIME,
        created_by_id=user_id,
        updated_by_id=user_id,
    )
    db.session.add(task)
    db.session.commit()
    return task


def _dispatch(task_id: int) -> AiTask:
    try:
        name = get_dispatcher().dispatch(task_id)
    except Exception:
        logger.exception("Could not dispatch AI task %s.", task_id)
        db.session.execute(
            update(AiTask)
            .where(AiTask.id == task_id, AiTask.status == AiTaskStatus.QUEUED.value)
            .values(
                status=AiTaskStatus.FAILED.value,
                error_message="This task could not be started.",
                finished_at=utcnow(),
            )
        )
        db.session.commit()
        raise AiTaskQueueError() from None

    if name:
        db.session.execute(
            update(AiTask).where(AiTask.id == task_id).values(cloud_task_name=name)
        )
        db.session.commit()
    db.session.expire_all()
    return db.session.get(AiTask, task_id)


def _finish_without_result(
    task: AiTask, from_statuses: list[str], to: AiTaskStatus, message: str
) -> None:
    now = utcnow()
    result = db.session.execute(
        update(AiTask)
        .where(AiTask.id == task.id, AiTask.status.in_(from_statuses))
        .values(
            status=to.value,
            decided_at=now,
            finished_at=func.coalesce(AiTask.finished_at, now),
        )
    )
    db.session.commit()
    if result.rowcount == 0:
        raise InvalidAiTaskStateError(message)
    db.session.expire_all()


def cancel(task: AiTask) -> AiTask:
    _finish_without_result(
        task, _ACTIVE, AiTaskStatus.CANCELLED, "This task has already finished."
    )
    get_dispatcher().cancel(task.cloud_task_name)
    _notifier().status_changed(task)
    return task


def reject(task: AiTask) -> AiTask:
    _finish_without_result(
        task,
        [AiTaskStatus.READY.value, AiTaskStatus.FAILED.value],
        AiTaskStatus.REJECTED,
        "This task can no longer be rejected.",
    )
    return task


def retry(task: AiTask, user_id: int | None) -> AiTask:
    if task.status != AiTaskStatus.FAILED.value:
        raise InvalidAiTaskStateError("Only a failed task can be retried.")
    new_task = enqueue(task.itinerary_id, task.type, task.params, user_id)
    reject(task)
    return new_task


def accept(
    task: AiTask, op_indexes: list[int], user_id: int | None, role: str | None = None
) -> dict[str, Any]:
    if task.status == AiTaskStatus.EXPIRED.value:
        raise InvalidAiTaskStateError("This proposal has expired.")
    if task.status != AiTaskStatus.READY.value:
        raise InvalidAiTaskStateError("This proposal has already been dealt with.")

    ops = task.result_ops or []
    chosen_indexes = sorted(set(op_indexes))
    if not chosen_indexes or chosen_indexes[-1] >= len(ops) or chosen_indexes[0] < 0:
        raise BadRequestError("Choose which of the proposed changes to apply.")

    stale = stale_ops(task)
    # An edited target is still applied; only a deleted one has nothing left to change.
    applicable = []
    for index in chosen_indexes:
        if stale.get(index) != snapshots.Staleness.DELETED:
            applicable.append(index)
    if not applicable:
        raise BadRequestError(
            "None of the chosen changes can be applied: what they change was deleted."
        )

    claimed = db.session.execute(
        update(AiTask)
        .where(AiTask.id == task.id, AiTask.status == AiTaskStatus.READY.value)
        .values(
            status=AiTaskStatus.ACCEPTED.value,
            decided_at=utcnow(),
            updated_by_id=user_id,
        )
    )
    if claimed.rowcount == 0:  # Someone else accepted it a moment ago.
        db.session.rollback()
        raise InvalidAiTaskStateError("This proposal has already been dealt with.")

    # Commits the claim and the changes together, or rolls both back.
    try:
        counts = apply_change_set(
            task.itinerary_id,
            [snapshots.strip_base(ops[i]) for i in applicable],
            user_id,
            role,
        )
    except Exception:
        db.session.rollback()
        raise
    skipped = len(chosen_indexes) - len(applicable)
    db.session.execute(
        update(AiTask).where(AiTask.id == task.id).values(applied_counts=counts)
    )
    db.session.commit()
    return {"applied": counts, "skipped_unavailable": skipped}

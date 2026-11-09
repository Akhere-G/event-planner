import logging
import time
from collections.abc import Callable
from datetime import timedelta
from enum import Enum

from sqlalchemy import and_, or_, update

from ..exceptions import AIProviderError, AIResponseError
from ..extensions import db
from ..models import AiTask, AiTaskStatus
from ..utils.clock import utcnow
from . import snapshots
from .context import TaskCancelledError, TaskContext
from .notifier import TaskNotifier
from .progress import DbProgressReporter
from .registry import get_handler

logger = logging.getLogger(__name__)

# A running task that has not reported for this long is presumed dead and may be
# claimed again. Progress is reported before every provider call.
LEASE = timedelta(minutes=5)
PROPOSAL_LIFETIME = timedelta(days=7)
RETRY_BACKOFF_SECONDS = 2

_USER_MESSAGES = {
    AIProviderError: "The AI service was unavailable.",
    AIResponseError: "The AI returned a response that could not be used.",
}
_DEFAULT_MESSAGE = "Something went wrong while running this task."


class RunOutcome(Enum):
    FINISHED = "finished"
    RETRY = "retry"
    SKIPPED = "skipped"


class TaskRunner:
    def __init__(self, notifier: TaskNotifier | None = None):
        self._notifier = notifier or TaskNotifier()

    def run_with_retries(
        self, task_id: int, sleep: Callable[[float], None] = time.sleep
    ) -> RunOutcome:
        """For dispatchers with no queue of their own to redeliver after a failure."""
        while True:
            outcome = self.run(task_id)
            if outcome is not RunOutcome.RETRY:
                return outcome
            sleep(RETRY_BACKOFF_SECONDS)

    def run(self, task_id: int) -> RunOutcome:
        task = self._claim(task_id)
        if task is None:
            return RunOutcome.SKIPPED

        ctx = TaskContext(
            task_id=task.id,
            itinerary_id=task.itinerary_id,
            user_id=task.created_by_id,
            params=dict(task.params),
            reporter=DbProgressReporter(task.id, self._notifier),
        )
        self._notifier.status_changed(task)
        snapshot = snapshots.capture(task.itinerary_id)
        db.session.commit()  # release the connection before any slow work

        try:
            ops = get_handler(task.type).run(ctx)
        except TaskCancelledError:
            return RunOutcome.SKIPPED
        except AIProviderError as exc:
            return self._retry_or_fail(task_id, exc)
        except Exception as exc:
            logger.exception("AI task %s failed.", task_id)
            return self._fail(task_id, exc)

        return self._finish(task_id, snapshots.attach_bases(ops, snapshot))

    def _claim(self, task_id: int) -> AiTask | None:
        now = utcnow()
        result = db.session.execute(
            update(AiTask)
            .where(
                AiTask.id == task_id,
                AiTask.attempts < AiTask.max_attempts,
                or_(
                    AiTask.status == AiTaskStatus.QUEUED.value,
                    and_(
                        AiTask.status == AiTaskStatus.RUNNING.value,
                        AiTask.heartbeat_at < now - LEASE,
                    ),
                ),
            )
            .values(
                status=AiTaskStatus.RUNNING.value,
                attempts=AiTask.attempts + 1,
                heartbeat_at=now,
                started_at=now,
                progress_text="Starting",
                progress_current=None,
                progress_total=None,
            )
        )
        db.session.commit()
        if result.rowcount == 0:
            return None
        return db.session.get(AiTask, task_id)

    def _retry_or_fail(self, task_id: int, error: Exception) -> RunOutcome:
        db.session.rollback()
        task = db.session.get(AiTask, task_id)
        if task is None or task.status != AiTaskStatus.RUNNING.value:
            return RunOutcome.SKIPPED
        if task.attempts >= task.max_attempts:
            return self._fail(task_id, error)

        logger.warning("AI task %s will be retried: %s", task_id, error)
        self._transition(task_id, AiTaskStatus.QUEUED, progress_text="Waiting to retry")
        self._notifier.status_changed(db.session.get(AiTask, task_id))
        db.session.commit()
        return RunOutcome.RETRY

    def _fail(self, task_id: int, error: Exception) -> RunOutcome:
        db.session.rollback()
        message = _USER_MESSAGES.get(type(error), _DEFAULT_MESSAGE)
        changed = self._transition(
            task_id,
            AiTaskStatus.FAILED,
            error_message=message,
            finished_at=utcnow(),
        )
        return self._announce(task_id, changed)

    def _finish(self, task_id: int, ops: list[dict]) -> RunOutcome:
        now = utcnow()
        if ops:
            changed = self._transition(
                task_id,
                AiTaskStatus.READY,
                result_ops=ops,
                finished_at=now,
                expires_at=now + PROPOSAL_LIFETIME,
            )
        else:
            changed = self._transition(
                task_id, AiTaskStatus.EMPTY, result_ops=[], finished_at=now
            )
        return self._announce(task_id, changed)

    @staticmethod
    def _transition(task_id: int, status: AiTaskStatus, **values) -> bool:
        """Move a running task to `status`; False if it is no longer running."""
        result = db.session.execute(
            update(AiTask)
            .where(AiTask.id == task_id, AiTask.status == AiTaskStatus.RUNNING.value)
            .values(status=status.value, **values)
        )
        db.session.commit()
        return result.rowcount == 1

    def _announce(self, task_id: int, changed: bool) -> RunOutcome:
        if not changed:
            return RunOutcome.SKIPPED
        try:
            self._notifier.finished(db.session.get(AiTask, task_id))
        except Exception:
            # The result is already saved; a failed notification must not undo it.
            logger.exception("Could not notify about AI task %s.", task_id)
        return RunOutcome.FINISHED

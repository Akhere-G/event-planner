from sqlalchemy import update

from ..extensions import db
from ..models import AiTask, AiTaskStatus
from ..utils.clock import utcnow
from .context import TaskCancelledError
from .notifier import TaskNotifier


class DbProgressReporter:
    """Writes progress to the task row. It doubles as the cancellation checkpoint:
    the row is only updated while the task is still running."""

    def __init__(self, task_id: int, notifier: TaskNotifier):
        self._task_id = task_id
        self._notifier = notifier

    def report(
        self, text: str, current: int | None = None, total: int | None = None
    ) -> None:
        result = db.session.execute(
            update(AiTask)
            .where(
                AiTask.id == self._task_id,
                AiTask.status == AiTaskStatus.RUNNING.value,
            )
            .values(
                progress_text=text[:255],
                progress_current=current,
                progress_total=total,
                heartbeat_at=utcnow(),
            )
        )
        db.session.commit()
        if result.rowcount == 0:
            raise TaskCancelledError()

        self._notifier.status_changed(db.session.get(AiTask, self._task_id))
        db.session.commit()  # the read above reopened a transaction; release it

from collections.abc import Callable

from ..models import AiTask, AiTaskStatus
from ..realtime.connections import UserConnectionStore, get_connection_store
from ..realtime.emit import safe_emit
from ..realtime.rooms import AI_TASK_EVENT, trip_room, user_room
from ..services import notification_service
from .registry import get_handler

Emit = Callable[[str, dict, str], None]


def task_event_payload(task: AiTask) -> dict:
    """What the browser hears. Never includes the proposed ops: those are fetched
    over REST, where access is checked."""
    return {
        "task_id": task.id,
        "trip_id": task.itinerary_id,
        "type": task.type,
        "status": task.status,
        "progress_text": task.progress_text,
        "progress_current": task.progress_current,
        "progress_total": task.progress_total,
    }


class TaskNotifier:
    """Tells a task's requester about it: socket events always, and for results a
    stored notification plus a web push when they are not in the app."""

    def __init__(
        self,
        emit: Emit = safe_emit,
        connections: UserConnectionStore | None = None,
    ):
        self._emit = emit
        self._connections = connections

    def status_changed(self, task: AiTask) -> None:
        self._emit(AI_TASK_EVENT, task_event_payload(task), self._room(task))

    def finished(self, task: AiTask) -> None:
        self.status_changed(task)
        if task.created_by_id is None:
            return  # Anonymous requesters have no account to notify.

        status = AiTaskStatus(task.status)
        title, message, link = self._describe(task, status)
        notification_service.create_notification(
            task.created_by_id, title, message, link
        )
        if status is AiTaskStatus.EMPTY or self._is_connected(task.created_by_id):
            return
        notification_service.send_web_push([task.created_by_id], title, message, link)

    def _is_connected(self, user_id: int) -> bool:
        connections = self._connections or get_connection_store()
        return connections.is_connected(user_id)

    @staticmethod
    def _room(task: AiTask) -> str:
        if task.created_by_id is not None:
            return user_room(task.created_by_id)
        return trip_room(task.itinerary_id)

    @staticmethod
    def _describe(task: AiTask, status: AiTaskStatus) -> tuple[str, str, str]:
        label = get_handler(task.type).label
        trip = task.itinerary.name
        trip_link = f"/trips/{task.itinerary_id}"
        task_link = f"{trip_link}?aiTask={task.id}"

        if status is AiTaskStatus.READY:
            count = len(task.result_ops or [])
            noun = "change" if count == 1 else "changes"
            return (
                "AI suggestions ready",
                f"{label} for {trip} proposes {count} {noun} to review.",
                task_link,
            )
        if status is AiTaskStatus.EMPTY:
            return (
                "No changes suggested",
                f"{label} for {trip} found nothing to change.",
                trip_link,
            )
        return (
            "AI task failed",
            f"{label} for {trip} could not be completed. You can try again.",
            task_link,
        )

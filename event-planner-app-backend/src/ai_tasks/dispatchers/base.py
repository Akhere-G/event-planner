from typing import Protocol


class TaskDispatcher(Protocol):
    """Gets a stored task executed. Where it runs is the implementation's concern."""

    def dispatch(self, task_id: int) -> str | None:
        """Hand the task over for execution. Returns a name usable to cancel it."""

    def cancel(self, dispatch_name: str | None) -> None:
        """Best-effort removal of a task that has not started yet."""

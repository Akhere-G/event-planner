from dataclasses import dataclass
from typing import Any, Protocol


class TaskCancelledError(Exception):
    """Raised inside a running task once the user has cancelled it."""


class ProgressReporter(Protocol):
    def report(
        self, text: str, current: int | None = None, total: int | None = None
    ) -> None:
        """Record a progress step. Raises TaskCancelledError if the task was cancelled."""


@dataclass
class TaskContext:
    """Everything a handler may use while running. Handlers never touch the task row."""

    task_id: int
    itinerary_id: int
    user_id: int | None
    params: dict[str, Any]
    reporter: ProgressReporter

    def progress(
        self, text: str, current: int | None = None, total: int | None = None
    ) -> None:
        self.reporter.report(text, current, total)

from dataclasses import dataclass
from typing import Any, Protocol


class TaskCancelledError(Exception):
    pass


class ProgressReporter(Protocol):
    def report(
        self, text: str, current: int | None = None, total: int | None = None
    ) -> None:
        """Record a progress step; raises TaskCancelledError once cancelled."""


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

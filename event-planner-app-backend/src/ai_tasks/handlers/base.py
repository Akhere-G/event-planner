from abc import ABC, abstractmethod
from typing import Any, Callable, ClassVar

from marshmallow import Schema

from ..context import TaskContext

CONFLICTS_WITH_ANYTHING = frozenset({"*"})


class AiTaskHandler(ABC):
    """One kind of background AI work. A new kind is a new subclass plus a registry entry."""

    task_type: ClassVar[str]
    label: ClassVar[str]
    params_schema: ClassVar[type[Schema]]
    # A Flask-Limiter limit string, or a callable returning one per request.
    rate_limit: ClassVar[str | Callable[[], str]] = "10 per minute"

    def conflict_scope(self, params: dict[str, Any]) -> frozenset[str]:
        """Tokens this task works on. Two active tasks of one type on one trip
        conflict when their scopes share a token."""
        return CONFLICTS_WITH_ANYTHING

    @abstractmethod
    def run(self, ctx: TaskContext) -> list[dict[str, Any]]:
        """Produce change-set ops. Must not write to the trip: the user accepts them later."""

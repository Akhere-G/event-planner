from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any, ClassVar

from marshmallow import Schema, ValidationError

from .context import TaskContext

CONFLICTS_WITH_ANYTHING = frozenset({"*"})


class AiTaskHandler(ABC):
    """One kind of background AI work: a subclass plus a registry entry."""

    task_type: ClassVar[str]
    label: ClassVar[str]
    params_schema: ClassVar[type[Schema]]
    rate_limit: ClassVar[str | Callable[[], str]] = "10 per minute"

    def conflict_scope(self, params: dict[str, Any]) -> frozenset[str]:
        """Tokens this task works on. Two active tasks of one type on one trip
        conflict when their scopes share a token."""
        return CONFLICTS_WITH_ANYTHING

    def validate_for_trip(self, itinerary, params: dict[str, Any]) -> None:
        return None

    @abstractmethod
    def run(self, ctx: TaskContext) -> list[dict[str, Any]]:
        """Produce change-set ops without writing to the trip."""


def ensure_dates_within_trip(itinerary, dates: list, field: str = "dates") -> None:
    for date in dates:
        if not itinerary.start_date <= date <= itinerary.end_date:
            raise ValidationError(
                {field: [f"{date:%d %b %Y} is outside this trip's dates."]}
            )

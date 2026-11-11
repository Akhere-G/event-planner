from datetime import date
from typing import Any

from ...models import Itinerary
from .editor_base import EditContext, EntityEditor


def _parse_date(value: Any) -> date | None:
    if not isinstance(value, str):
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


class TripEditor(EntityEditor):
    """The trip's own start date, end date and budget. Admin-only, like the PATCH."""

    entity = "trip"
    title = "TRIP"
    fields = ("start_date", "end_date", "budget_amount_gbp")
    kinds = ("update",)
    hint = (
        "start_date and end_date (YYYY-MM-DD), budget_amount_gbp (a number in GBP, "
        "or null to remove the budget)"
    )

    @classmethod
    def is_available(cls, context: EditContext) -> bool:
        return context.is_admin

    def describe_items(self, itinerary: Itinerary) -> dict[int, str]:
        self.start_date = itinerary.start_date
        self.end_date = itinerary.end_date
        budget = itinerary.budget_amount_gbp
        return {
            itinerary.id: (
                f"start_date {self.start_date} | end_date {self.end_date} | "
                f"budget_amount_gbp {'none' if budget is None else budget}"
            )
        }

    def normalise(
        self, kind: str, item_id: int | None, data: dict[str, Any]
    ) -> dict[str, Any] | None:
        start = self._date_after(data, "start_date", self.start_date)
        end = self._date_after(data, "end_date", self.end_date)
        if start is None or end is None or end < start:
            return None
        return data

    def _date_after(
        self, data: dict[str, Any], field: str, current: date
    ) -> date | None:
        if field not in data:
            return current
        return _parse_date(data[field])

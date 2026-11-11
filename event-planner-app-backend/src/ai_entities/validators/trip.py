from ..context import Requester
from ..describers.base import EntityDescription
from ..json_types import JsonObject
from .base import EntityValidator
from .dates import dates_in_order


class TripValidator(EntityValidator):
    entity = "trip"
    fields = ("start_date", "end_date", "budget_amount_gbp")
    kinds = ("update",)
    prompt_hint = (
        "start_date and end_date (YYYY-MM-DD), budget_amount_gbp (a number in GBP, "
        "or null to remove the budget)"
    )

    @classmethod
    def is_available(cls, requester: Requester) -> bool:
        return requester.is_admin

    def check_edit(
        self, current: EntityDescription, data: JsonObject
    ) -> JsonObject | None:
        if not dates_in_order(current, data, "start_date", "end_date"):
            return None
        return data

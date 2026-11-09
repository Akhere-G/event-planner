from typing import Any

from ...schemas.ai_schema import OptimiseDayParamsSchema
from ...services.day_optimisation_service import OptimiseOptions, optimise_days
from ..context import TaskContext
from ..handler import AiTaskHandler, ensure_dates_within_trip
from ..registry import register


@register
class OptimiseDayHandler(AiTaskHandler):
    task_type = "optimise_day"
    label = "Optimise days"
    params_schema = OptimiseDayParamsSchema

    def conflict_scope(self, params: dict[str, Any]) -> frozenset[str]:
        return frozenset(params["dates"])

    def validate_for_trip(self, itinerary, params: dict[str, Any]) -> None:
        ensure_dates_within_trip(itinerary, self.params_schema().load(params)["dates"])

    def run(self, ctx: TaskContext) -> list[dict[str, Any]]:
        values = self.params_schema().load(ctx.params)
        options = OptimiseOptions(
            dates=values["dates"],
            goals=values["goals"],
            pace=values["pace"],
            day_start=values["day_start"],
            day_end=values["day_end"],
            locked_event_ids=frozenset(values["locked_event_ids"]),
            allow_add_remove=values["allow_add_remove"],
            instructions=values["instructions"],
        )
        return optimise_days(ctx.itinerary_id, options, progress=ctx.progress)

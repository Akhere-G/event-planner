from typing import Any

from ...schemas.ai_schema import NoParamsSchema
from ...services.trip_generation_service import generate_trip_plan
from ...utils.rate_limit import ai_generation_limit
from ..context import TaskContext
from ..registry import register
from ..handler import AiTaskHandler


@register
class GenerateTripHandler(AiTaskHandler):
    task_type = "generate_trip"
    label = "Trip plan"
    params_schema = NoParamsSchema
    rate_limit = staticmethod(ai_generation_limit)

    def run(self, ctx: TaskContext) -> list[dict[str, Any]]:
        return generate_trip_plan(ctx.itinerary_id, progress=ctx.progress)

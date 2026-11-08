from typing import Any

from ...schemas.ai_schema import EventSuggestionRequestSchema
from ...services.ai_services import get_event_suggestions
from ...services.change_set_service import build_event_create_ops
from ..context import TaskContext
from ..registry import register
from ..handler import AiTaskHandler


@register
class FillDayHandler(AiTaskHandler):
    task_type = "fill_day"
    label = "Fill in day"
    params_schema = EventSuggestionRequestSchema

    def conflict_scope(self, params: dict[str, Any]) -> frozenset[str]:
        return frozenset({params["date"]})

    def run(self, ctx: TaskContext) -> list[dict[str, Any]]:
        options = self.params_schema().load(ctx.params)
        suggestions = get_event_suggestions(
            ctx.itinerary_id,
            options["date"],
            pace=options["pace"],
            companions=options["companions"],
            transport=options["transport"],
            interests=options["interests"],
            progress=ctx.progress,
        )
        return build_event_create_ops(suggestions)

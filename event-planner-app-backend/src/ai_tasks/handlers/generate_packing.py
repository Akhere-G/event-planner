from typing import Any

from ...schemas.ai_schema import NoParamsSchema
from ...services.ai_services import generate_packing_list
from ...services.change_set_service import build_packing_create_op
from ..context import TaskContext
from ..registry import register
from ..handler import AiTaskHandler


@register
class GeneratePackingHandler(AiTaskHandler):
    task_type = "generate_packing"
    label = "Packing list"
    params_schema = NoParamsSchema

    def run(self, ctx: TaskContext) -> list[dict[str, Any]]:
        items = generate_packing_list(ctx.itinerary_id, progress=ctx.progress)
        # Personal items belong to a user, so an anonymous requester gets shared ones.
        return [
            build_packing_create_op(
                item["name"],
                item["category"],
                item["is_shared"] or ctx.user_id is None,
            )
            for item in items
        ]

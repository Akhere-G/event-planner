from flask import Blueprint

from ..ai_tasks.runner import RunOutcome, TaskRunner
from ..middleware.cloud_tasks_auth import cloud_tasks_only
from ..utils.format_response import api_response

internal_task_bp = Blueprint("internal_tasks", __name__)


@internal_task_bp.route("/ai-tasks/<int:task_id>/run", methods=["POST"])
@cloud_tasks_only
def run_ai_task_route(task_id: int):
    """Called by Cloud Tasks. A non-2xx answer makes the queue deliver it again."""
    outcome = TaskRunner().run(task_id)
    if outcome is RunOutcome.RETRY:
        return api_response(
            success=False,
            message="The task will be retried.",
            error="The AI service is temporarily unavailable.",
            status_code=503,
        )
    return api_response(success=True, message=f"Task {outcome.value}.")

from flask import Blueprint, request

from ..extensions import limiter
from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..middleware.login_required import login_required
from ..models import AiTaskStatus, UserRole
from ..schemas.ai_task_schema import (
    AcceptAiTaskSchema,
    AiTaskDetailSchema,
    AiTaskSchema,
)
from ..services import ai_task_service
from ..utils.format_response import api_response
from ..utils.rate_limit import ai_task_limit, ai_task_scope, get_user_or_ip

ai_task_bp = Blueprint("ai_tasks", __name__)
pending_ai_task_bp = Blueprint("pending_ai_tasks", __name__)

_EDITORS = [UserRole.ADMIN, UserRole.EDITOR]
_EVERYONE = [*_EDITORS, UserRole.VIEWER]
_NEEDS_EDITOR = "You must be an admin or an editor to use AI tasks."


def _detail(task):
    outdated = (
        sorted(ai_task_service.outdated_indexes(task))
        if task.status == AiTaskStatus.READY.value
        else []
    )
    return {**AiTaskDetailSchema().dump(task), "outdated_op_indexes": outdated}


@ai_task_bp.route("/<string:task_type>", methods=["POST"])
@itinerary_access_required(allowed_roles=_EDITORS, message=_NEEDS_EDITOR)
@limiter.limit(
    ai_task_limit,
    key_func=get_user_or_ip,
    scope=ai_task_scope,
)
def create_ai_task_route(itinerary_id: int, task_type: str, access: ItineraryAccess):
    task = ai_task_service.enqueue(
        itinerary_id, task_type, request.get_json(silent=True) or {}, access.user_id
    )
    return api_response(
        success=True,
        data=AiTaskSchema().dump(task),
        message="The AI task has been queued.",
        status_code=202,
    )


@ai_task_bp.route("", methods=["GET"])
@itinerary_access_required(allowed_roles=_EVERYONE)
def list_ai_tasks_route(itinerary_id: int, access: ItineraryAccess):
    tasks = ai_task_service.list_trip_tasks(itinerary_id, access.user_id)
    return api_response(
        success=True,
        data=AiTaskSchema(many=True).dump(tasks),
        message="Fetched AI tasks.",
    )


@ai_task_bp.route("/<int:task_id>", methods=["GET"])
@itinerary_access_required(allowed_roles=_EVERYONE)
def get_ai_task_route(itinerary_id: int, task_id: int, access: ItineraryAccess):
    task = ai_task_service.get_task(itinerary_id, task_id, access.user_id)
    return api_response(success=True, data=_detail(task), message="Fetched AI task.")


@ai_task_bp.route("/<int:task_id>/cancel", methods=["POST"])
@itinerary_access_required(allowed_roles=_EDITORS, message=_NEEDS_EDITOR)
def cancel_ai_task_route(itinerary_id: int, task_id: int, access: ItineraryAccess):
    task = ai_task_service.get_task(itinerary_id, task_id, access.user_id)
    return api_response(
        success=True,
        data=AiTaskSchema().dump(ai_task_service.cancel(task)),
        message="The AI task has been cancelled.",
    )


@ai_task_bp.route("/<int:task_id>/retry", methods=["POST"])
@itinerary_access_required(allowed_roles=_EDITORS, message=_NEEDS_EDITOR)
def retry_ai_task_route(itinerary_id: int, task_id: int, access: ItineraryAccess):
    task = ai_task_service.get_task(itinerary_id, task_id, access.user_id)
    return api_response(
        success=True,
        data=AiTaskSchema().dump(ai_task_service.retry(task, access.user_id)),
        message="The AI task has been queued again.",
        status_code=202,
    )


@ai_task_bp.route("/<int:task_id>/accept", methods=["POST"])
@itinerary_access_required(allowed_roles=_EDITORS, message=_NEEDS_EDITOR)
def accept_ai_task_route(itinerary_id: int, task_id: int, access: ItineraryAccess):
    validated = AcceptAiTaskSchema().load(request.get_json(silent=True) or {})
    task = ai_task_service.get_task(itinerary_id, task_id, access.user_id)
    result = ai_task_service.accept(task, validated["op_indexes"], access.user_id)
    return api_response(
        success=True,
        data=result,
        message="Applied the changes.",
    )


@ai_task_bp.route("/<int:task_id>/reject", methods=["POST"])
@itinerary_access_required(allowed_roles=_EDITORS, message=_NEEDS_EDITOR)
def reject_ai_task_route(itinerary_id: int, task_id: int, access: ItineraryAccess):
    task = ai_task_service.get_task(itinerary_id, task_id, access.user_id)
    return api_response(
        success=True,
        data=AiTaskSchema().dump(ai_task_service.reject(task)),
        message="Dismissed the AI task.",
    )


@pending_ai_task_bp.route("/pending", methods=["GET"])
@login_required
def list_pending_ai_tasks_route(user_id: int):
    tasks = ai_task_service.list_pending_proposals(user_id)
    return api_response(
        success=True,
        data=AiTaskSchema(many=True).dump(tasks),
        message="Fetched pending AI proposals.",
    )

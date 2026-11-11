from flask import Blueprint, request

from ..extensions import limiter
from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..models import UserRole
from ..schemas.ai_schema import EditTripRequestSchema
from ..schemas.ai_task_schema import AiTaskSchema
from ..services.ai_services import get_insights
from ..services.trip_editing_service import edit_trip_with_ai
from ..utils.format_response import api_response
from ..utils.rate_limit import get_user_or_ip

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/insights/<int:itinerary_id>")
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
def get_insights_route(itinerary_id: int, access: ItineraryAccess):
    insights = get_insights(itinerary_id)
    return api_response(success=True, data=insights, message="Fetched insights")


@ai_bp.route("/edit-trip/<int:itinerary_id>", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to change this trip.",
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
def edit_trip_route(itinerary_id: int, access: ItineraryAccess):
    request_data = EditTripRequestSchema().load(request.get_json(silent=True) or {})
    result = edit_trip_with_ai(
        itinerary_id,
        access.user_id,
        access.role,
        request_data["message"],
        request_data["history"],
    )
    task = AiTaskSchema().dump(result.task) if result.task else None
    return api_response(
        success=True,
        data={"reply": result.reply, "task": task},
        message="Generated proposed changes.",
    )

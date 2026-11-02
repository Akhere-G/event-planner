from datetime import datetime

from flask import Blueprint, request
from marshmallow import ValidationError

from ..extensions import limiter
from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..models import UserRole
from ..schemas.ai_schema import EventSuggestionRequestSchema
from ..services.ai_services import (
    generate_trip_plan,
    get_event_suggestions,
    get_insights,
    optimise_events,
)
from ..services.change_set_service import (
    build_event_create_ops,
    build_event_update_ops,
)
from ..utils.format_response import api_response
from ..utils.rate_limit import ai_generation_limit, get_user_or_ip

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/insights/<int:itinerary_id>")
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
def get_insights_route(itinerary_id: int, access: ItineraryAccess):
    insights = get_insights(itinerary_id)
    return api_response(success=True, data=insights, message="Fetched insights")


@ai_bp.route("/suggest-events/<int:itinerary_id>/preview", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to change events.",
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
def preview_event_suggestions_route(itinerary_id: int, access: ItineraryAccess):
    """Suggest events for a day. Nothing is saved until the change set is applied."""
    try:
        validated = EventSuggestionRequestSchema().load(
            request.get_json(silent=True) or {}
        )
    except ValidationError as err:
        return api_response(success=False, error=err.messages, status_code=400)

    try:
        event_date = datetime.strptime(validated["date"], "%Y-%m-%d")
    except ValueError:
        return api_response(
            success=False,
            error="Invalid format for date.",
            message="Invalid format for date.",
            status_code=400,
        )

    suggestions = get_event_suggestions(
        itinerary_id,
        event_date,
        pace=validated["pace"],
        companions=validated["companions"],
        transport=validated["transport"],
        interests=validated["interests"],
    )
    return api_response(
        success=True,
        data={"ops": build_event_create_ops(suggestions)},
        message="Generated suggestions.",
    )


@ai_bp.route("/optimise-events/<int:itinerary_id>/preview", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to change events.",
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
def preview_optimised_events_route(itinerary_id: int, access: ItineraryAccess):
    """Propose new times for a day's events. Nothing is saved until applied."""
    body = request.get_json(silent=True) or {}
    date = body.get("date")

    if not date:
        return api_response(success=False, error="Date is required.", status_code=400)

    try:
        event_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return api_response(
            success=False,
            error="Invalid format for date.",
            message="Invalid format for date.",
            status_code=400,
        )

    optimised_events = optimise_events(itinerary_id, event_date)
    return api_response(
        success=True,
        data={"ops": build_event_update_ops(optimised_events)},
        message="Generated optimised times.",
    )


@ai_bp.route("/generate-trip/<int:itinerary_id>/preview", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to generate a trip plan.",
)
@limiter.limit(ai_generation_limit, key_func=get_user_or_ip)
def preview_generated_trip_route(itinerary_id: int, access: ItineraryAccess):
    """Plan a whole trip from the saved preferences. Nothing is saved until applied."""
    return api_response(
        success=True,
        data={"ops": generate_trip_plan(itinerary_id)},
        message="Generated trip plan.",
    )

from datetime import datetime

from flask import Blueprint, request

from ..extensions import limiter
from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..models import UserRole
from ..schemas.event_schema import EventSchema
from ..services.ai_services import get_event_suggestions, get_insights, optimise_events
from ..services.events_service import create_events, update_events
from ..utils.format_response import api_response
from ..utils.rate_limit import get_user_or_ip

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/insights/<int:itinerary_id>")
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
@limiter.limit("10 per minute")
def get_insights_route(itinerary_id: int, access: ItineraryAccess):
    insights = get_insights(itinerary_id)
    return api_response(success=True, data=insights, message="Fetched insights")


@ai_bp.route("/suggest-events/<int:itinerary_id>", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
@limiter.limit("10 per minute")
def get_event_suggestions_route(itinerary_id: int, access: ItineraryAccess):
    schema = EventSchema(many=True)

    date = request.json.get("date")
    pace = request.json.get("pace", "balanced")
    companions = request.json.get("companions", "couple")
    transport = request.json.get("transport", "public_transport")
    interests = request.json.get("interests")

    if not date:
        return api_response(success=False, error="Date is required.", status_code=400)
    try:
        event_date = datetime.strptime(date, "%Y-%m-%d")

        suggestions = get_event_suggestions(
            itinerary_id,
            event_date,
            pace=pace,
            companions=companions,
            transport=transport,
            interests=interests,
        )
        validated_suggestions = schema.load(suggestions)
        create_events(itinerary_id, validated_suggestions, access.user_id)
        return api_response(
            success=True,
            data=schema.dump(validated_suggestions),
            message="Fetched suggestions.",
        )
    except ValueError:
        return api_response(
            success=False,
            error="Invalid format for date.",
            message="Invalid format for date.",
            status_code=400,
        )


@ai_bp.route("/optimise-events/<int:itinerary_id>", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
@limiter.limit("10 per minute")
def optimise_events_route(itinerary_id: int, access: ItineraryAccess):
    date = request.json.get("date")
    schema = EventSchema(many=True)

    if not date:
        return api_response(success=False, error="Date is required.", status_code=400)
    try:
        event_date = datetime.strptime(date, "%Y-%m-%d")

        optimised_events = optimise_events(itinerary_id, event_date)
        updated_events = update_events(itinerary_id, optimised_events, access.user_id)
        validated_events = schema.dump(updated_events)
        return api_response(
            success=True,
            data=validated_events,
            message="Optimised events.",
        )

    except ValueError:
        return api_response(
            success=False,
            error="Invalid format for date.",
            message="Invalid format for date.",
            status_code=400,
        )

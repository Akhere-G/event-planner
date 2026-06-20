from flask import Blueprint, request
from ..middleware.login_required import login_required
from ..utils.format_response import api_response
from ..services.ai_services import get_insights, get_event_suggestions, optimise_events
from ..services.itineraries_service import is_authorised
from ..models import UserRole
from ..exceptions import (
    UserNotAuthorisedError,
    ItineraryDoesNotExistError,
    EventNotFoundError,
)
from datetime import datetime
from ..services.events_service import create_events, update_events
from ..schemas.event_schema import EventSchema
from marshmallow import ValidationError


ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/insights/<int:itinerary_id>")
@login_required
def get_insights_route(user_id: int, itinerary_id: int):
    try:
        is_authorised(
            user_id, itinerary_id, [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
        )
        insights = get_insights(itinerary_id)
        return api_response(success=True, data=insights, message="Fetched insights")
    except (UserNotAuthorisedError, ItineraryDoesNotExistError) as err:
        return api_response(
            success=False,
            error=err.message,
            message=err.message,
            status_code=err.status_code,
        )


@ai_bp.route("/suggest-events/<int:itinerary_id>", methods=["POST"])
@login_required
def get_event_suggestions_route(user_id: int, itinerary_id: int):
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
        is_authorised(
            user_id, itinerary_id, [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
        )
        suggestions = get_event_suggestions(
            itinerary_id,
            event_date,
            pace=pace,
            companions=companions,
            transport=transport,
            interests=interests,
        )
        validated_suggestions = schema.load(suggestions)
        create_events(itinerary_id, validated_suggestions, user_id)
        return api_response(
            success=True,
            data=schema.dump(validated_suggestions),
            message="Fetched suggestions.",
        )
    except (UserNotAuthorisedError, ItineraryDoesNotExistError) as err:
        return api_response(
            success=False,
            error=err.message,
            message=err.message,
            status_code=err.status_code,
        )
    except ValueError:
        return api_response(
            success=False,
            error="Invalid format for date.",
            message="Invalid format for date.",
            status_code=400,
        )


@ai_bp.route("/optimise-events/<int:itinerary_id>", methods=["POST"])
@login_required
def optimise_events_route(user_id: int, itinerary_id: int):
    date = request.json.get("date")
    schema = EventSchema(many=True)

    if not date:
        return api_response(success=False, error="Date is required.", status_code=400)
    try:
        event_date = datetime.strptime(date, "%Y-%m-%d")
        is_authorised(
            user_id, itinerary_id, [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
        )
        optimised_events = optimise_events(itinerary_id, event_date)
        updated_events = update_events(itinerary_id, optimised_events, user_id)
        validated_events = schema.dump(updated_events)
        return api_response(
            success=True,
            data=validated_events,
            message="Optimised events.",
        )
    except (
        UserNotAuthorisedError,
        ItineraryDoesNotExistError,
        EventNotFoundError,
    ) as err:
        return api_response(
            success=False,
            error=err.message,
            message=err.message,
            status_code=err.status_code,
        )
    except ValueError:
        return api_response(
            success=False,
            error="Invalid format for date.",
            message="Invalid format for date.",
            status_code=400,
        )
    except ValidationError as err:
        return api_response(
            message="Bad Request.",
            success=False,
            error=err.messages,
            status_code=400,
        )

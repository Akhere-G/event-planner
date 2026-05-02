from flask import Blueprint, request
from ..middleware.login_required import login_required
from ..utils.format_response import api_response
from ..services.ai_services import get_insights, get_event_suggestions
from ..services.itineraries_service import is_authorised
from ..models import UserRole
from ..exceptions import UserNotAuthorisedError, ItineraryDoesNotExistError
from datetime import datetime
from ..services.events_service import create_events
from ..schemas.event_schema import EventSchema

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/insights/<int:itinerary_id>")
@login_required
def get_insights_route(user_id: str = None, itinerary_id: str = None):
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
def get_event_suggestions_route(user_id: str = None, itinerary_id: str = None):
    date = request.json.get("date")
    schema = EventSchema(many=True)

    if not date:
        return api_response(success=False, error="Date is required.", status_code=400)
    try:
        event_date = datetime.strptime(date, "%Y-%m-%d")
        is_authorised(
            user_id, itinerary_id, [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
        )
        suggestions = get_event_suggestions(itinerary_id, event_date)
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

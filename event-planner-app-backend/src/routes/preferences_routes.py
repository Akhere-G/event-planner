from flask import Blueprint, request

from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..models import UserRole
from ..schemas.trip_preferences_schema import TripPreferencesSchema
from ..services import trip_preferences_service
from ..utils.format_response import api_response

preferences_bp = Blueprint("preferences", __name__)


@preferences_bp.route("", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
def get_preferences_route(itinerary_id: int, access: ItineraryAccess):
    preferences = trip_preferences_service.get_preferences(itinerary_id)
    return api_response(
        success=True,
        data=TripPreferencesSchema().dump(preferences) if preferences else None,
        message="Fetched trip preferences.",
    )


@preferences_bp.route("", methods=["PUT"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to change trip preferences.",
)
def put_preferences_route(itinerary_id: int, access: ItineraryAccess):
    validated = TripPreferencesSchema().load(request.get_json(silent=True) or {})
    preferences = trip_preferences_service.upsert_preferences(
        itinerary_id, validated, access.user_id
    )
    return api_response(
        success=True,
        data=TripPreferencesSchema().dump(preferences),
        message="Saved trip preferences.",
    )

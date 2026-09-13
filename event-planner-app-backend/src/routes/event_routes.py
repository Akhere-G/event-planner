from flask import Blueprint, request

from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..schemas.event_schema import EventSchema
from ..schemas.itinerary_schema import UserRole
from ..services.events_service import (
    create_event,
    delete_event,
    get_events,
    update_event,
)
from ..utils.format_response import api_response

event_bp = Blueprint("events", __name__)


@event_bp.route("")
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
def get_events_route(itinerary_id: int, access: ItineraryAccess):
    schema = EventSchema(many=True)

    events = get_events(itinerary_id)
    return api_response(
        success=True,
        data={"events": schema.dump(events)},
        message="Fetched events from user itineraries.",
        status_code=200,
    )


@event_bp.route("", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to add events.",
)
def create_events_route(itinerary_id: int, access: ItineraryAccess):
    schema = EventSchema()

    validated_event = schema.load(request.json)
    validated_event["created_by_id"] = access.user_id
    validated_event["updated_by_id"] = access.user_id
    new_event = create_event(itinerary_id, validated_event)
    return api_response(
        message="Created new event.",
        data=schema.dump(new_event),
        success=True,
        status_code=201,
    )


@event_bp.route("/<int:event_id>", methods=["PATCH"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to update events.",
)
def update_event_route(itinerary_id: int, access: ItineraryAccess, event_id: int):
    schema = EventSchema(partial=True)
    validated_event = schema.load(request.json)
    validated_event["updated_by_id"] = access.user_id
    updated_event = update_event(itinerary_id, event_id, validated_event)
    return api_response(
        message="Updated event.",
        data=schema.dump(updated_event),
        success=True,
        status_code=200,
    )


@event_bp.route("/<int:event_id>", methods=["DELETE"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to delete events.",
)
def delete_event_route(itinerary_id: int, access: ItineraryAccess, event_id: int):

    delete_event(itinerary_id, event_id)
    return api_response(
        message="Event removed from itinerary.",
        success=True,
        data={"deleted_id": event_id},
        status_code=200,
    )

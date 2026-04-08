from flask import Blueprint, request
from ..middleware.login_required import login_required
from ..services.events_service import (
    get_events,
    create_event,
    update_event,
    delete_event,
)
from ..services.itineraries_service import is_authorised, get_itinerary_membership
from ..schemas.event_schema import EventSchema
from ..schemas.itinerary_schema import UserRole
from ..utils.format_response import api_response
from marshmallow import ValidationError
from ..exceptions import (
    UserNotAuthorisedError,
    EventNotFoundError,
    ItineraryDoesNotExistError,
)

event_bp = Blueprint("events", __name__)


@event_bp.route("")
@login_required
def get_events_routes(user_id: str, itinerary_id: str):
    schema = EventSchema(many=True)
    try:
        get_itinerary_membership(user_id, itinerary_id)

        events = get_events(itinerary_id)
        return api_response(
            success=True,
            data={"events": schema.dump(events)},
            message="Fetched events from user itineraries.",
            status_code=200,
        )
    except ItineraryDoesNotExistError as err:
        return api_response(
            message=err.message, success=False, status_code=err.status_code
        )


@event_bp.route("", methods=["POST"])
@login_required
def create_events_route(user_id: int, itinerary_id: int):
    schema = EventSchema()

    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
            message="You must be an admin or an editor to add events.",
        )
        validated_event = schema.load(request.json)
        validated_event["created_by_id"] = user_id
        validated_event["updated_by_id"] = user_id
        new_event = create_event(itinerary_id, validated_event)
        return api_response(
            message="Created new event.",
            data=schema.dump(new_event),
            success=True,
            status_code=201,
        )
    except ValidationError as err:
        return api_response(
            message="Bad request.", success=False, error=err.messages, status_code=400
        )
    except (UserNotAuthorisedError, ItineraryDoesNotExistError) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )


@event_bp.route("<int:event_id>", methods=["PATCH"])
@login_required
def update_event_route(user_id: int, itinerary_id: int, event_id: int):
    schema = EventSchema(partial=True)

    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
            message="You must be an admin or an editor to update events.",
        )
        validated_event = schema.load(request.json)
        validated_event["updated_by_id"] = user_id
        updated_event = update_event(itinerary_id, event_id, validated_event)
        return api_response(
            message="Updated event.",
            data=schema.dump(updated_event),
            success=True,
            status_code=200,
        )
    except ValidationError as err:
        return api_response(
            message="Bad request.", success=False, error=err.messages, status_code=400
        )
    except (
        UserNotAuthorisedError,
        ItineraryDoesNotExistError,
        EventNotFoundError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )


@event_bp.route("/<int:event_id>", methods=["DELETE"])
@login_required
def delete_event_route(user_id: int, itinerary_id: int, event_id: int):
    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
            message="You must be an admin or an editor to delete events.",
        )

        delete_event(itinerary_id, event_id)
        return api_response(
            message="Event removed from itinerary.",
            success=True,
            data={"deleted_id": event_id},
            status_code=200,
        )
    except (
        UserNotAuthorisedError,
        ItineraryDoesNotExistError,
        EventNotFoundError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )

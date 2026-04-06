from flask import Blueprint, request
from ..middleware.login_required import login_required
from ..controllers.events_controller import get_events, create_event, update_event
from ..schemas.event_schema import EventSchema
from ..utils.format_response import api_response
from marshmallow import ValidationError
from ..exceptions import (
    UserNotAuthorisedError,
    EventNotFoundError,
    ItineraryDoesNotExistError,
)

events_bp = Blueprint("events", __name__)


@events_bp.route("")
@login_required
def get_events_routes(user_id: str, itinerary_id: str):
    schema = EventSchema(many=True)

    events = get_events(user_id, itinerary_id)
    return api_response(
        success=True,
        data={"events": schema.dump(events)},
        message="Fetched events from user itineraries.",
        status_code=200,
    )


@events_bp.route("", methods=["POST"])
@login_required
def create_events_route(user_id: int, itinerary_id: int):
    schema = EventSchema()

    try:
        validated_event = schema.load(request.json)
        new_event = create_event(user_id, itinerary_id, validated_event)
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


@events_bp.route("<int:event_id>", methods=["PATCH"])
@login_required
def update_event_route(user_id: int, itinerary_id: int, event_id: int):
    schema = EventSchema(partial=True)

    try:
        validated_event = schema.load(request.json)
        updated_event = update_event(user_id, itinerary_id, event_id, validated_event)
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

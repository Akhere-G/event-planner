from flask import Blueprint, request
from ..controllers.itinerary_controller import (
    get_itineraries,
    create_itinerary,
    update_itinerary,
    delete_itinerary,
)
from ..exceptions import (
    UserDoesNotExistError,
    ItineraryDoesNotExistError,
    UserNotAuthorisedError,
)
from ..schemas.itinerary_schema import ItinerarySchema
from ..utils.format_response import api_response
from ..middleware.login_required import login_required
from marshmallow import ValidationError

itinerary_bp = Blueprint("itinerary", __name__)


@itinerary_bp.route("", methods=["GET"])
@login_required
def get_itineraries_route(user_id):
    try:
        schema = ItinerarySchema(many=True)
        result = get_itineraries(user_id)
        itineraries = schema.dump(result)
        return api_response(
            data={"itineraries": itineraries},
            message="Fetched user itineraries.",
            success=True,
            status_code=200,
        )
    except UserDoesNotExistError:
        return api_response(
            message="User not found.",
            success=False,
            error="User not found.",
            status_code=404,
        )


@itinerary_bp.route("", methods=["POST"])
@login_required
def create_itinerary_route(user_id):
    try:
        schema = ItinerarySchema()
        validated_data = schema.load(request.json)
        new_itinerary = create_itinerary(user_id, validated_data)

        return api_response(
            success=True,
            data=schema.dump(new_itinerary),
            message="Succesfully created new itinerary.",
            status_code=201,
        )

    except ValidationError as err:
        return api_response(
            message="Bad request.", success=False, error=err.messages, status_code=400
        )


@itinerary_bp.route("<int:itinerary_id>", methods=["PATCH"])
@login_required
def update_itinerary_route(user_id, itinerary_id):
    try:
        schema = ItinerarySchema(partial=True)
        validated_data = schema.load(request.json)
        updated_itinerary = update_itinerary(user_id, itinerary_id, validated_data)

        return api_response(
            success=True,
            message="Successfully updated itinerary.",
            data=schema.dump(updated_itinerary),
            status_code=200,
        )
    except ValidationError as err:
        return api_response(
            success=False, message="Bad request.", error=err.messages, status_code=400
        )
    except (ItineraryDoesNotExistError, UserNotAuthorisedError) as err:
        return api_response(
            success=False,
            message=err.message,
            error=err.message,
            status_code=err.status_code,
        )


@itinerary_bp.route("/<int:itinerary_id>", methods=["DELETE"])
@login_required
def delete_itinerary_route(user_id, itinerary_id):
    try:
        delete_itinerary(user_id, itinerary_id)
        return api_response(
            success=True, message="Successfully deleted Itinerary.", status_code=200
        )
    except ItineraryDoesNotExistError as err:
        return api_response(
            success=False,
            message=err.message,
            error=err.message,
            status_code=err.status_code,
        )

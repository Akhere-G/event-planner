from flask import Blueprint, request
from ..services.itineraries_service import (
    get_itinerary_memberships,
    get_itinerary_membership,
    create_itinerary,
    update_itinerary,
    delete_itinerary,
    is_authorised,
    get_itinerary_count,
)
from ..exceptions import (
    ItineraryDoesNotExistError,
    UserNotAuthorisedError,
)
from ..schemas.itinerary_schema import ItinerarySchema, ItineraryWithRoleSchema
from ..utils.format_response import api_response
from ..middleware.login_required import login_required
from marshmallow import ValidationError

itinerary_bp = Blueprint("itinerary", __name__)


@itinerary_bp.route("", methods=["GET"])
@login_required
def get_itineraries_route(user_id):
    schema = ItineraryWithRoleSchema(many=True)
    limit = request.args.get("limit", type=int)
    offset = request.args.get("offset", default=0, type=int)

    count = get_itinerary_count(user_id)
    result = get_itinerary_memberships(user_id, limit, offset)
    itineraries = schema.dump(result)

    has_more = False
    if limit is not None:
        has_more = (offset + len(itineraries)) < count

    return api_response(
        data={"itineraries": itineraries, "has_more": has_more},
        message="Fetched user itineraries.",
        success=True,
        status_code=200,
    )


@itinerary_bp.route("<int:itinerary_id>", methods=["GET"])
@login_required
def get_itinerary_route(user_id, itinerary_id):
    try:
        schema = ItineraryWithRoleSchema()
        result = get_itinerary_membership(user_id, itinerary_id)

        return api_response(
            data=schema.dump(result),
            message="Fetched itinerary.",
            success=True,
            status_code=200,
        )
    except ItineraryDoesNotExistError:
        return api_response(
            message="Itinerary not found.",
            success=False,
            error="Itinerary not found.",
            status_code=404,
        )


@itinerary_bp.route("", methods=["POST"])
@login_required
def create_itinerary_route(user_id):
    try:
        schema = ItinerarySchema()
        validated_data = schema.load(request.json)
        validated_data["created_by_id"] = user_id
        validated_data["updated_by_id"] = user_id
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
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            message="You must be an admin to update this itinerary.",
        )
        schema = ItinerarySchema(partial=True)
        validated_data = schema.load(request.json)
        validated_data["updated_by_id"] = user_id
        updated_itinerary = update_itinerary(itinerary_id, validated_data)

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
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            message="You must be an admin to delete this itinerary.",
        )
        delete_itinerary(itinerary_id)
        return api_response(
            success=True,
            message="Successfully deleted Itinerary.",
            data={"deleted_id": itinerary_id},
            status_code=200,
        )
    except (ItineraryDoesNotExistError, UserNotAuthorisedError) as err:
        return api_response(
            success=False,
            message=err.message,
            error=err.message,
            status_code=err.status_code,
        )

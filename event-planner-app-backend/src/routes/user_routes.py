from flask import Blueprint, request
from ..middleware.login_required import login_required
from ..services.itineraries_service import get_itinerary_membership, is_authorised
from ..exceptions import (
    ItineraryDoesNotExistError,
    UserNotAuthorisedError,
    UserDoesNotExistError,
    UserAlreadyExistsError,
)
from ..utils.format_response import api_response
from ..schemas.user_schema import UserWithRoleSchema, AddOrUpdateUserRoleSchema
from ..services.users_service import add_user_to_itinerary
from marshmallow import ValidationError


user_bp = Blueprint("user", __name__)


@user_bp.route("", methods=["GET"])
@login_required
def get_users_routes(user_id: int, itinerary_id: int):
    schema = UserWithRoleSchema(many=True)
    try:
        result = get_itinerary_membership(user_id, itinerary_id)
        itinerary = result.itinerary
        return api_response(
            data={"users": schema.dump(itinerary.user_memberships)},
            success=True,
            message="Fetched users.",
            status_code=200,
        )
    except ItineraryDoesNotExistError as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )


@user_bp.route("", methods=["POST"])
@login_required
def add_user_to_itinerary_route(user_id: int, itinerary_id: int):
    schema = AddOrUpdateUserRoleSchema()
    user_schema = UserWithRoleSchema()

    try:
        is_authorised(
            user_id, itinerary_id, message="You must be an admin to add other users."
        )

        validated_data = schema.load(request.json)

        membership = add_user_to_itinerary(user_id, itinerary_id, validated_data)
        return api_response(
            message="Added user.",
            success=True,
            data=user_schema.dump(membership),
            status_code=201,
        )
    except ValidationError as err:
        return api_response(
            message="Bad request.",
            success=False,
            error=err.messages,
            status_code=400,
        )
    except (
        ItineraryDoesNotExistError,
        UserNotAuthorisedError,
        UserDoesNotExistError,
        UserAlreadyExistsError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )

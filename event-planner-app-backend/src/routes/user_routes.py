from flask import Blueprint, request

from ..exceptions import (
    ItineraryDoesNotExistError,
    UserDoesNotExistError,
    UserNotAuthorisedError,
)
from ..middleware.login_required import login_required
from ..models import UserRole
from ..schemas.user_schema import UserWithRoleSchema
from ..services.itineraries_service import (
    get_itinerary_memberships,
    is_authorised,
    is_user_in_itinerary,
)
from ..services.users_service import (
    remove_user,
    update_user_role,
)
from ..utils.format_response import api_response

user_bp = Blueprint("user", __name__)


@user_bp.route("", methods=["GET"])
@login_required
def get_users_routes(user_id: int, itinerary_id: int):
    schema = UserWithRoleSchema(many=True)
    try:
        is_user_in_itinerary(user_id, itinerary_id)
        users = get_itinerary_memberships(user_id, itinerary_id)
        return api_response(
            data={"users": schema.dump(users)},
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


@user_bp.route("/<int:other_user_id>", methods=["PATCH"])
@login_required
def update_user_role_route(user_id: int, itinerary_id: int, other_user_id: int):
    new_role = request.json.get("role")
    if not new_role or not UserRole.has_value(new_role):
        return api_response(
            message="Bad request.",
            success=False,
            error="User role must be admin, editor, or viewer.",
            status_code=400,
        )
    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            message="You must be an admin to update user roles.",
        )

        user_schema = UserWithRoleSchema()
        membership = update_user_role(
            user_id=user_id,
            itinerary_id=itinerary_id,
            other_user_id=other_user_id,
            new_role=new_role,
        )
        return api_response(
            data=user_schema.dump(membership),
            success=True,
            message="Updated membership.",
            status_code=200,
        )
    except (
        ItineraryDoesNotExistError,
        UserNotAuthorisedError,
        UserDoesNotExistError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )


@user_bp.route("/<int:other_user_id>", methods=["DELETE"])
@login_required
def remove_user_route(user_id: int, itinerary_id: int, other_user_id: int):
    try:
        if user_id != other_user_id:
            is_authorised(
                user_id=user_id,
                itinerary_id=itinerary_id,
                message="You must be an admin to other remove users.",
            )
        removed_user_id = remove_user(
            user_id=user_id, itinerary_id=itinerary_id, other_user_id=other_user_id
        )
        return api_response(
            data={"removed_user_id": removed_user_id},
            success=True,
            message="removed member.",
            status_code=200,
        )
    except (
        ItineraryDoesNotExistError,
        UserNotAuthorisedError,
        UserDoesNotExistError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )

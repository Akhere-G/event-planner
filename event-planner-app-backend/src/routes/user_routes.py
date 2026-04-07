from flask import Blueprint
from ..middleware.login_required import login_required
from ..services.itineraries_service import get_itinerary_membership
from ..exceptions import ItineraryDoesNotExistError
from ..utils.format_response import api_response
from ..schemas.user_schema import UserWithRoleSchema

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


@user_bp.route("<int:other_user_id>", methods=["POST"])
@login_required
def add_user_to_itinerary(user_id: int, itinerary_id: int, other_user_id: int):
    schema = UserWithRoleSchema(many=True)
    try:
        result = get_itinerary_membership(user_id, itinerary_id)
        itinerary = result.itinerary

    except ItineraryDoesNotExistError as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )

from flask import Blueprint

from ..middleware.login_required import login_required
from ..schemas.invite_schema import InviteSchema
from ..schemas.itinerary_schema import ItinerarySchema
from ..schemas.user_schema import UserWithRoleSchema
from ..services.invite_service import (
    accept_invite,
    decline_invite,
    get_user_invite,
    get_user_invites,
    join_itinerary,
)
from ..utils.format_response import api_response

user_invites_bp = Blueprint("user_invites", __name__)


@user_invites_bp.route("")
@login_required
def get_invites_route(user_id: int):
    schema = InviteSchema(many=True)
    result = get_user_invites(user_id)
    invites = schema.dump(result)
    return api_response(
        data={"invites": invites},
        success=True,
        message="Fetched user invites.",
        status_code=200,
    )


@user_invites_bp.route("/<string:token>")
@login_required
def get_invite_route(user_id: int, token: str):
    schema = InviteSchema()
    result = get_user_invite(user_id, token)

    return api_response(
        data=schema.dump(result),
        success=True,
        message="Fetched user invite.",
        status_code=200,
    )


@user_invites_bp.route("/<string:token>/accept", methods=["POST"])
@login_required
def accept_invite_route(user_id: int, token: str):
    schema = UserWithRoleSchema()
    result = accept_invite(user_id, token)
    return api_response(
        data=schema.dump(result),
        success=True,
        message="Accepted invite.",
        status_code=200,
    )


@user_invites_bp.route("/<token>/decline", methods=["POST"])
@login_required
def decline_invite_route(user_id: int, token: str):
    schema = InviteSchema()
    result = decline_invite(user_id, token)
    return api_response(
        data=schema.dump(result),
        success=True,
        message="Declined invite.",
        status_code=200,
    )


@user_invites_bp.route("/join/<token>", methods=["POST"])
@login_required
def join_itinerary_route(user_id, token):
    schema = ItinerarySchema()
    itinerary = join_itinerary(user_id, token)
    return api_response(
        success=True,
        message="Joined itinerary",
        status_code=200,
        data=schema.dump(itinerary),
    )

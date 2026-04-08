from flask import Blueprint
from ..middleware.login_required import login_required
from ..services.invite_service import (
    get_user_invites,
    get_user_invite,
    accept_invite,
    decline_invite,
)
from ..schemas.invite_schema import InviteSchema
from ..schemas.user_schema import UserWithRoleSchema
from ..utils.format_response import api_response
from ..exceptions import (
    InviteNotFoundError,
    UserAlreadyExistsError,
    BadRequestError,
    ItineraryDoesNotExistError,
)


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
    try:
        schema = InviteSchema()
        result = get_user_invite(user_id, token)

        return api_response(
            data=schema.dump(result),
            success=True,
            message="Fetched user invite.",
            status_code=200,
        )
    except InviteNotFoundError as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )


@user_invites_bp.route("/<string:token>/accept", methods=["POST"])
@login_required
def accept_invite_route(user_id: int, token: str):
    schema = UserWithRoleSchema()
    try:
        result = accept_invite(user_id, token)
        return api_response(
            data=schema.dump(result),
            success=True,
            message="Accepted invite.",
            status_code=200,
        )
    except (
        InviteNotFoundError,
        BadRequestError,
        ItineraryDoesNotExistError,
        UserAlreadyExistsError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )


@user_invites_bp.route("/<string:token>/decline", methods=["POST"])
@login_required
def decline_invite_route(user_id: int, token: str):
    schema = InviteSchema()
    try:
        result = decline_invite(user_id, token)
        return api_response(
            data=schema.dump(result),
            success=True,
            message="Declined invite.",
            status_code=200,
        )
    except (
        InviteNotFoundError,
        BadRequestError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )

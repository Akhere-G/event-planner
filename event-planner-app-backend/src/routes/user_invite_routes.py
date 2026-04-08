from flask import Blueprint
from ..middleware.login_required import login_required
from ..services.invite_service import get_user_invites, get_user_invite
from ..schemas.invite_schema import InviteSchema
from ..utils.format_response import api_response
from ..exceptions import InviteNotFoundError


user_invites_bp = Blueprint("user_invites", __name__)


@user_invites_bp.route("")
@login_required
def get_invites_routes(user_id: int):
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
def get_invite_routes(user_id: int, token: str):
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

from flask import Blueprint
from ..middleware.login_required import login_required
from ..services.invite_service import get_user_invites
from ..schemas.invite_schema import InviteSchema
from ..utils.format_response import api_response

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

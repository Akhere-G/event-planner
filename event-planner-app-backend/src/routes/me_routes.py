from flask import Blueprint, request

from ..middleware.login_required import login_required
from ..schemas.user_schema import UpdateMeSchema
from ..services.users_service import update_me
from ..utils.format_response import api_response

me_bp = Blueprint("me", __name__)


@me_bp.route("", methods=["PATCH"])
@login_required
def update_me_route(user_id: int):
    data = UpdateMeSchema().load(request.json or {})
    user = update_me(user_id, data)
    return api_response(
        success=True,
        data={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_demo": user.is_demo,
            "home_currency": user.home_currency,
        },
        message="Updated your account.",
    )

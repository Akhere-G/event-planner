from flask import Blueprint, request, session

from ..extensions import limiter
from ..schemas.user_schema import LoginSchema, RegisterSchema
from ..services.auth_service import get_user, login_user, register_user
from ..utils.format_response import api_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per minute")
def register_user_route():
    schema = RegisterSchema()
    data = schema.load(request.json)
    data.pop("repeat_password", None)
    user = register_user(**data)
    session["user_id"] = user["id"]
    return api_response(
        data=user,
        message="Successfully registered an account.",
        success=True,
        status_code=200,
    )


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("20 per minute")
def login_user_route():
    schema = LoginSchema()
    data = schema.load(request.json)
    user = login_user(**data)  # type: ignore
    session["user_id"] = user["id"]
    return api_response(
        data=user,
        message="Successfully logged in",
        success=True,
        status_code=200,
    )


@auth_bp.route("/logout", methods=["POST"])
def logout_user_route():
    session.clear()
    return api_response(
        success=True, message="Successfully logged out.", status_code=200
    )


@auth_bp.route("/check", methods=["GET"])
def check_auth():
    user_id = session.get("user_id")
    user = get_user(user_id)
    if user:
        return api_response(
            success=True,
            data={
                "id": user.id,
                "email": user.email,
                "username": user.username,
            },
            message="User is authenticated.",
        )
    return api_response(success=False, message="Not authenticated.", status_code=401)

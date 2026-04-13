from flask import Blueprint, request, session
from marshmallow import ValidationError
from ..services.auth_service import register_user, login_user
from ..exceptions import (
    UserAlreadyExistsError,
    UserDoesNotExistError,
    InvalidCredentialsError,
)
from ..schemas.user_schema import RegisterSchema, LoginSchema
from ..utils.format_response import api_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register_user_route():
    schema = RegisterSchema()
    try:
        data = schema.load(request.json)
        data.pop("repeat_password", None)
        user_id = register_user(**data)
        session["user_id"] = user_id
        return api_response(
            data={"user_id": user_id},
            message="Successfully registered an account.",
            success=True,
            status_code=200,
        )
    except ValidationError as err:
        return api_response(
            message="Bad Request.",
            success=False,
            error=err.messages,
            status_code=400,
        )
    except UserAlreadyExistsError:
        return api_response(
            message="Could not register. Try again or try to log in.",
            success=False,
            error={"general": ["Could not register. Try again or try to log in."]},
            status_code=400,
        )


@auth_bp.route("/login", methods=["POST"])
def login_user_route():
    schema = LoginSchema()
    try:
        data = schema.load(request.json)
        user_id = login_user(**data)
        session["user_id"] = user_id
        return api_response(
            data={"user_id": user_id},
            message="Successfully logged in",
            success=True,
            status_code=200,
        )

    except ValidationError as err:
        return api_response(
            message="Bad Request.",
            success=False,
            error=err.messages,
            status_code=400,
        )

    except (UserDoesNotExistError, InvalidCredentialsError):
        return api_response(
            message="Bad Request.",
            success=False,
            error={"general": ["Could not login. Password or email incorrect."]},
            status_code=401,
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
    if user_id:
        return api_response(
            success=True, data={"user_id": user_id}, message="User is authenticated."
        )
    return api_response(success=False, message="Not authenticated.", status_code=401)

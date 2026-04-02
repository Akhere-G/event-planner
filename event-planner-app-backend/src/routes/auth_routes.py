from flask import Blueprint, jsonify, request, session
from marshmallow import ValidationError
from ..controllers.auth_controller import register_user, login_user
from ..exceptions import (
    UserAlreadyExistsError,
    UserDoesNotExistError,
    InvalidCredentialsError,
)
from ..schemas.user_schema import RegisterSchema, LoginSchema

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register_user_route():
    schema = RegisterSchema()
    try:
        data = schema.load(request.json)
        data.pop("repeat_password", None)
        user_id = register_user(**data)
        session["user_id"] = user_id
        return jsonify({"user_id": user_id}), 201
    except ValidationError as err:
        return jsonify(err.messages), 400
    except UserAlreadyExistsError:
        return jsonify(
            {"error": "Could not register. Try again or try to log in."}
        ), 400


@auth_bp.route("/login", methods=["POST"])
def login_user_route():
    schema = LoginSchema()
    try:
        data = schema.load(request.json)
        user_id = login_user(**data)
        session["user_id"] = user_id
        return jsonify({"user_id": user_id}), 200
    except ValidationError as err:
        return jsonify(err.messages), 400
    except (UserDoesNotExistError, InvalidCredentialsError):
        return jsonify({"error": "Could not login. Password or email incorrect."}), 401

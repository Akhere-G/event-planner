from flask import Blueprint, jsonify, request, session
from ..controllers.auth_controller import register_user, login_user
from ..exceptions import (
    UserAlreadyExistsError,
    UserDoesNotExistError,
    InvalidCredentialsError,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register_user_route():
    data = request.json
    try:
        user_id = register_user(**data)
        session["user_id"] = user_id
        return jsonify({"user_id": user_id}), 201
    except UserAlreadyExistsError:
        return jsonify(
            {"error": "Could not register. Try again or try to log in."}
        ), 400


@auth_bp.route("/login", methods=["POST"])
def login_user_route():
    data = request.json
    try:
        user_id = login_user(**data)
        session["user_id"] = user_id
        return jsonify({"user_id": user_id}), 200
    except (UserDoesNotExistError, InvalidCredentialsError):
        return jsonify({"error": "Could not login. Password or email incorrect."}), 401

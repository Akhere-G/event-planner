from flask import Blueprint, session, jsonify
from ..controllers.itinerary_controller import get_itineraries
from ..exceptions import UserDoesNotExistError
from ..schemas.itinerary_schema import ItinerarySchema

itinerary_bp = Blueprint("itinerary", __name__)


@itinerary_bp.route("", methods=["GET"])
def get_itineraries_route():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorised. Please log in."}), 401

    schema = ItinerarySchema(many=True)

    try:
        result = get_itineraries(user_id)
        itineraries = schema.dump(result)

        return jsonify({"itineraries": itineraries}), 200
    except UserDoesNotExistError:
        return jsonify({"error": "User not found."}), 404

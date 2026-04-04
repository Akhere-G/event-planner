from flask import Blueprint, session, jsonify
from ..controllers.itinerary_controller import get_itineraries
from ..exceptions import UserDoesNotExistError
from ..schemas.itinerary_schema import ItinerarySchema
from ..utils.format_response import api_response

itinerary_bp = Blueprint("itinerary", __name__)


@itinerary_bp.route("", methods=["GET"])
def get_itineraries_route():
    user_id = session.get("user_id")

    if not user_id:
        return api_response(
            message="Unauthorised. Please log in.",
            success=False,
            error="Unauthorised. Please log in.",
            status_code=401,
        )

    schema = ItinerarySchema(many=True)

    try:
        result = get_itineraries(user_id)
        itineraries = schema.dump(result)
        return api_response(
            data={"itineraries": itineraries},
            message="Fetched user itineraries.",
            success=True,
            status_code=200,
        )
    except UserDoesNotExistError:
        return api_response(
            message="User not found.",
            success=False,
            error="User not found.",
            status_code=404,
        )

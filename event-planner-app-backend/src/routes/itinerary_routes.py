from flask import Blueprint
from ..controllers.itinerary_controller import get_itineraries
from ..exceptions import UserDoesNotExistError
from ..schemas.itinerary_schema import ItinerarySchema
from ..utils.format_response import api_response
from ..middleware.login_required import login_required

itinerary_bp = Blueprint("itinerary", __name__)


@itinerary_bp.route("", methods=["GET"])
@login_required
def get_itineraries_route(user_id):
    try:
        schema = ItinerarySchema(many=True)
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

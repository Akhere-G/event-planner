from flask import Blueprint
from ..middleware.login_required import login_required
from ..services.itineraries_service import get_itinerary_membership
from ..services.invite_service import get_invites
from ..exceptions import ItineraryDoesNotExistError
from ..utils.format_response import api_response
from ..schemas.invite_schema import InviteSchema

invite_bp = Blueprint("invite", __name__)


@invite_bp.route("")
@login_required
def get_invites_route(user_id: int, itinerary_id: int):
    schema = InviteSchema(many=True)
    try:
        get_itinerary_membership(user_id, itinerary_id)
        result = get_invites(itinerary_id)
        invites = schema.dump(result)
        return api_response(
            data={"invites": invites},
            success=True,
            message="Fetched invites",
            status_code=200,
        )
    except (ItineraryDoesNotExistError,) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )

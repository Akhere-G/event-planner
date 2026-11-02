from flask import Blueprint, request

from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..models import UserRole
from ..schemas.change_set_schema import ApplyChangeSetSchema
from ..services.change_set_service import apply_change_set
from ..utils.format_response import api_response

change_set_bp = Blueprint("change_sets", __name__)


@change_set_bp.route("/apply", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to apply changes.",
)
def apply_change_set_route(itinerary_id: int, access: ItineraryAccess):
    validated = ApplyChangeSetSchema().load(request.get_json(silent=True) or {})
    counts = apply_change_set(itinerary_id, validated["ops"], access.user_id)
    return api_response(
        success=True,
        data=counts,
        message="Applied changes.",
    )

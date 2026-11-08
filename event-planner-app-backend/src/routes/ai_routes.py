from flask import Blueprint

from ..extensions import limiter
from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..models import UserRole
from ..services.ai_services import get_insights
from ..utils.format_response import api_response
from ..utils.rate_limit import get_user_or_ip

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/insights/<int:itinerary_id>")
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
def get_insights_route(itinerary_id: int, access: ItineraryAccess):
    insights = get_insights(itinerary_id)
    return api_response(success=True, data=insights, message="Fetched insights")

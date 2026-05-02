from flask import Blueprint
from ..middleware.login_required import login_required
from ..utils.format_response import api_response
from ..services.ai_services import get_insights
from ..services.itineraries_service import is_authorised
from ..models import UserRole
from ..exceptions import UserNotAuthorisedError

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/insights/<int:itinerary_id>")
@login_required
def get_insights_route(user_id: str = None, itinerary_id: str = None):
    try:
        is_authorised(
            user_id, itinerary_id, [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
        )
        insights = get_insights(itinerary_id)
        return api_response(success=True, data=insights, message="Fetched insights")
    except UserNotAuthorisedError as err:
        return api_response(
            success=False,
            error=err.message,
            message=err.message,
            status_code=err.status_code,
        )

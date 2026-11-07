from flask import Blueprint, request

from ..middleware.login_required import login_required
from ..services import fx_service
from ..utils.format_response import api_response

fx_bp = Blueprint("fx", __name__)


@fx_bp.route("/rates", methods=["GET"])
@login_required
def get_rates_route(user_id: int):
    base = fx_service.normalise_currency(request.args.get("base", "GBP"))
    rates = fx_service.get_latest_rates(base)
    response, status = api_response(
        success=True,
        data={"base": base, "rates": {k: float(v) for k, v in sorted(rates.items())}},
        message="Fetched exchange rates.",
    )
    response.headers["Cache-Control"] = "private, max-age=86400"
    return response, status

from flask import Blueprint, request

from ..middleware.login_required import login_required
from ..schemas.fx_schema import FxRatesQuerySchema, FxRatesSchema
from ..services import fx_service
from ..utils.format_response import api_response

fx_bp = Blueprint("fx", __name__)

ONE_DAY_SECONDS = 24 * 60 * 60


@fx_bp.route("/rates", methods=["GET"])
@login_required
def get_rates_route(user_id: int):
    query = FxRatesQuerySchema().load(request.args.to_dict())
    rates = fx_service.get_latest_rates(query["base"])
    response, status = api_response(
        success=True,
        data=FxRatesSchema().dump({"base": query["base"], "rates": rates}),
        message="Fetched exchange rates.",
    )
    response.headers["Cache-Control"] = f"private, max-age={ONE_DAY_SECONDS}"
    return response, status

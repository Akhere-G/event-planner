from flask import Blueprint, request

from ..exceptions import UserNotAuthorisedError
from ..extensions import limiter
from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..middleware.login_required import login_required
from ..models import UserRole
from ..schemas.itinerary_schema import ItinerarySchema
from ..schemas.trip_template_schema import (
    CloneTemplateSchema,
    PublishTemplateSchema,
    TemplateListQuerySchema,
)
from ..services import template_service
from ..utils.format_response import api_response
from ..utils.rate_limit import get_user_or_ip

template_bp = Blueprint("templates", __name__)
template_publish_bp = Blueprint("template_publish", __name__)

PUBLIC_READ_LIMIT = "60 per minute"


@template_bp.route("", methods=["GET"])
@limiter.limit(PUBLIC_READ_LIMIT)
def list_templates_route():
    query = TemplateListQuerySchema().load(request.args.to_dict())
    rows, total = template_service.list_templates(
        query["search"], query["limit"], query["offset"]
    )
    return api_response(
        success=True,
        data={
            "templates": [template_service.serialize_summary(t) for t in rows],
            "total": total,
            "has_more": query["offset"] + len(rows) < total,
        },
        message="Fetched templates.",
    )


@template_bp.route("/<string:slug>", methods=["GET"])
@limiter.limit(PUBLIC_READ_LIMIT)
def get_template_route(slug: str):
    template = template_service.get_public_template(slug)
    return api_response(
        success=True,
        data=template_service.serialize_detail(template),
        message="Fetched template.",
    )


@template_bp.route("/<string:slug>/clone", methods=["POST"])
@limiter.limit("10 per minute", key_func=get_user_or_ip)
@login_required
def clone_template_route(slug: str, user_id: int):
    validated = CloneTemplateSchema().load(request.get_json(silent=True) or {})
    itinerary = template_service.clone_template(slug, user_id, validated["start_date"])
    return api_response(
        success=True,
        data=ItinerarySchema(only=("id", "name", "start_date", "end_date")).dump(
            itinerary
        ),
        message="Created a trip from the template.",
        status_code=201,
    )


def _require_user(access: ItineraryAccess) -> int:
    if access.user_id is None:
        raise UserNotAuthorisedError("Log in to publish a trip as a template.")
    return access.user_id


@template_publish_bp.route("", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN],
    message="You must be an admin to manage this trip's template.",
)
def get_publish_status_route(itinerary_id: int, access: ItineraryAccess):
    template = template_service.get_template_for_itinerary(itinerary_id)
    return api_response(
        success=True,
        data=template_service.serialize_publish_status(template),
        message="Fetched template status.",
    )


@template_publish_bp.route("", methods=["POST"])
@limiter.limit("10 per minute", key_func=get_user_or_ip)
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN],
    message="You must be an admin to publish this trip as a template.",
)
def publish_route(itinerary_id: int, access: ItineraryAccess):
    user_id = _require_user(access)
    validated = PublishTemplateSchema().load(request.get_json(silent=True) or {})
    template = template_service.publish_itinerary(
        itinerary_id, user_id, validated["title"], validated["description"]
    )
    return api_response(
        success=True,
        data=template_service.serialize_publish_status(template),
        message="Published template.",
    )


@template_publish_bp.route("", methods=["DELETE"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN],
    message="You must be an admin to unpublish this template.",
)
def unpublish_route(itinerary_id: int, access: ItineraryAccess):
    user_id = _require_user(access)
    template = template_service.unpublish_itinerary(itinerary_id, user_id)
    return api_response(
        success=True,
        data=template_service.serialize_publish_status(template),
        message="Unpublished template.",
    )

import datetime

from flask import Blueprint, request, session

from src.models import UserRole

from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..middleware.login_required import login_required
from ..schemas.itinerary_schema import ItinerarySchema, ItineraryWithRoleSchema
from ..services.itineraries_service import (
    create_itinerary,
    delete_itinerary,
    get_itineraries,
    get_itinerary_count,
    get_itinerary_membership,
    update_itinerary,
)
from ..services.timezone_service import get_timezone_for_coordinates
from ..utils.format_response import api_response

itinerary_bp = Blueprint("itinerary", __name__)


@itinerary_bp.route("", methods=["GET"])
def get_itineraries_route():
    user_id = session.get("user_id")
    anonymous_access_code = request.headers.get("X-Itinerary-Access-Code")
    schema = ItineraryWithRoleSchema(many=True)
    limit = request.args.get("limit", type=int)
    offset = request.args.get("offset", default=0, type=int)

    if user_id is None:
        count = 1
    else:
        count = get_itinerary_count(user_id)
    result = get_itineraries(
        user_id,
        limit=limit,
        offset=offset,
        anonymous_access_code=anonymous_access_code,
    )
    itineraries = schema.dump(result)

    has_more = False
    if limit is not None and count is not None:
        has_more = (offset + len(itineraries)) < count

    return api_response(
        data={"itineraries": itineraries, "has_more": has_more},
        message="Fetched user itineraries.",
        success=True,
        status_code=200,
    )


@itinerary_bp.route("<int:itinerary_id>", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
def get_itinerary_route(itinerary_id: int, access: ItineraryAccess):
    schema = ItineraryWithRoleSchema()
    result = get_itinerary_membership(
        access.user_id, itinerary_id, access.anonymous_access_code
    )

    return api_response(
        data=schema.dump(result),
        message="Fetched itinerary.",
        success=True,
        status_code=200,
    )


@itinerary_bp.route("", methods=["POST"])
def create_itinerary_route():
    user_id = session.get("user_id")
    schema = ItinerarySchema()
    validated_data = schema.load(request.json)
    validated_data["created_by_id"] = user_id
    validated_data["updated_by_id"] = user_id

    # Get timezone
    start_date = validated_data.get("start_date")
    timestamp = None
    if start_date:
        if isinstance(start_date, datetime.date) and not isinstance(
            start_date, datetime.datetime
        ):
            start_date = datetime.datetime.combine(start_date, datetime.time.min)
        timestamp = int(start_date.timestamp())

    timezone = get_timezone_for_coordinates(
        latitude=validated_data.get("latitude"),
        longitude=validated_data.get("longitude"),
        timestamp=timestamp,
    )
    validated_data["timezone"] = timezone

    new_itinerary = create_itinerary(user_id, validated_data)

    return api_response(
        success=True,
        data=schema.dump(new_itinerary),
        message="Succesfully created new itinerary.",
        status_code=201,
    )


@itinerary_bp.route("<int:itinerary_id>", methods=["PATCH"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN],
    message="You must be an admin to update this itinerary.",
)
def update_itinerary_route(itinerary_id: int, access: ItineraryAccess):
    schema = ItinerarySchema(partial=True)
    validated_data = schema.load(request.json)
    validated_data["updated_by_id"] = access.user_id
    updated_itinerary = update_itinerary(itinerary_id, validated_data)

    return api_response(
        success=True,
        message="Successfully updated itinerary.",
        data=schema.dump(updated_itinerary),
        status_code=200,
    )


@itinerary_bp.route("/<int:itinerary_id>", methods=["DELETE"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN],
    message="You must be an admin to delete this itinerary.",
)
def delete_itinerary_route(itinerary_id: int, access: ItineraryAccess):
    delete_itinerary(access.itinerary_id)
    return api_response(
        success=True,
        message="Successfully deleted Itinerary.",
        data={"deleted_id": itinerary_id},
        status_code=200,
    )

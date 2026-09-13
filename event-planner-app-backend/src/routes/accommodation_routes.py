from flask import Blueprint, request

from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..schemas.accommodation_schema import AccommodationSchema
from ..schemas.itinerary_schema import UserRole
from ..services.accommodation_service import (
    create_accommodation,
    delete_accommodation,
    get_accommodation,
    get_accommodations,
    update_accommodation,
)
from ..utils.format_response import api_response

accommodation_bp = Blueprint("accommodation", __name__)


@accommodation_bp.route("", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
def get_accommodations_route(itinerary_id: int, access: ItineraryAccess):
    results = get_accommodations(itinerary_id)
    schema = AccommodationSchema(many=True)
    return api_response(
        success=True,
        data=schema.dump(results),
        message="Fetched accommodations.",
        status_code=200,
    )


@accommodation_bp.route("", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to add accommodations.",
)
def create_accommodation_route(itinerary_id: int, access: ItineraryAccess):
    schema = AccommodationSchema()

    validated_data = schema.load(request.json)
    accommodation = create_accommodation(access.user_id, itinerary_id, validated_data)
    return api_response(
        success=True,
        data=schema.dump(accommodation),
        message="Created accommodation.",
        status_code=201,
    )


@accommodation_bp.route("/<int:accommodation_id>", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
)
def get_accommodation_route(
    itinerary_id: int, access: ItineraryAccess, accommodation_id: int
):
    accommodation = get_accommodation(itinerary_id, accommodation_id)
    if not accommodation:
        return api_response(
            success=False,
            error="Accommodation not found.",
            message="Accommodation not found.",
            status_code=404,
        )
    schema = AccommodationSchema()
    return api_response(
        success=True,
        data=schema.dump(accommodation),
        message="Fetched accommodation.",
        status_code=200,
    )


@accommodation_bp.route("/<int:accommodation_id>", methods=["PATCH"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to update accommodations.",
)
def update_accommodation_route(
    itinerary_id: int, access: ItineraryAccess, accommodation_id: int
):
    schema = AccommodationSchema()
    validated_data = schema.load(request.json, partial=True)
    accommodation = update_accommodation(
        itinerary_id, accommodation_id, access.user_id, validated_data
    )
    return api_response(
        success=True,
        data=schema.dump(accommodation),
        message="Updated accommodation.",
        status_code=200,
    )


@accommodation_bp.route("/<int:accommodation_id>", methods=["DELETE"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to delete accommodations.",
)
def delete_accommodation_route(
    itinerary_id: int, access: ItineraryAccess, accommodation_id: int
):

    deleted_id = delete_accommodation(itinerary_id, accommodation_id)
    return api_response(
        success=True,
        data={"deletedId": deleted_id},
        message="Deleted accommodation.",
        status_code=200,
    )

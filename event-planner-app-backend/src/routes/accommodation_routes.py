from flask import Blueprint, request

from ..middleware.login_required import login_required
from ..schemas.accommodation_schema import AccommodationSchema
from ..schemas.itinerary_schema import UserRole
from ..services.accommodation_service import (
    create_accommodation,
    delete_accommodation,
    get_accommodation,
    get_accommodations,
    update_accommodation,
)
from ..services.itineraries_service import (
    is_authorised,
    is_user_in_itinerary,
)
from ..utils.format_response import api_response

accommodation_bp = Blueprint("accommodation", __name__)


@accommodation_bp.route("", methods=["GET"])
@login_required
def get_accommodations_route(user_id: int, itinerary_id: int):
    is_user_in_itinerary(user_id, itinerary_id)
    results = get_accommodations(itinerary_id)
    schema = AccommodationSchema(many=True)
    return api_response(
        success=True,
        data=schema.dump(results),
        message="Fetched accommodations.",
        status_code=200,
    )


@accommodation_bp.route("", methods=["POST"])
@login_required
def create_accommodation_route(user_id: int, itinerary_id: int):
    schema = AccommodationSchema()
    is_authorised(
        user_id=user_id,
        itinerary_id=itinerary_id,
        authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
        message="You must be an admin or an editor to add accommodations.",
    )
    validated_data = schema.load(request.json)
    accommodation = create_accommodation(user_id, itinerary_id, validated_data)
    return api_response(
        success=True,
        data=schema.dump(accommodation),
        message="Created accommodation.",
        status_code=201,
    )


@accommodation_bp.route("/<int:accommodation_id>", methods=["GET"])
@login_required
def get_accommodation_route(user_id: int, itinerary_id: int, accommodation_id: int):
    is_user_in_itinerary(user_id, itinerary_id)
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
@login_required
def update_accommodation_route(user_id: int, itinerary_id: int, accommodation_id: int):
    schema = AccommodationSchema()
    is_authorised(
        user_id=user_id,
        itinerary_id=itinerary_id,
        authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
        message="You must be an admin or an editor to update accommodations.",
    )
    validated_data = schema.load(request.json, partial=True)
    accommodation = update_accommodation(
        itinerary_id, accommodation_id, user_id, validated_data
    )
    return api_response(
        success=True,
        data=schema.dump(accommodation),
        message="Updated accommodation.",
        status_code=200,
    )


@accommodation_bp.route("/<int:accommodation_id>", methods=["DELETE"])
@login_required
def delete_accommodation_route(user_id: int, itinerary_id: int, accommodation_id: int):
    is_authorised(
        user_id=user_id,
        itinerary_id=itinerary_id,
        authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
        message="You must be an admin or an editor to delete accommodations.",
    )
    deleted_id = delete_accommodation(itinerary_id, accommodation_id)
    return api_response(
        success=True,
        data={"deletedId": deleted_id},
        message="Deleted accommodation.",
        status_code=200,
    )

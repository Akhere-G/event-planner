from flask import Blueprint, request

from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..schemas.flight_schema import FlightSchema
from ..schemas.itinerary_schema import UserRole
from ..services.flight_service import (
    create_flight,
    delete_flight,
    get_flight,
    get_flights,
    update_flight,
)
from ..utils.format_response import api_response

flight_bp = Blueprint("flight", __name__)


@flight_bp.route("", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
def get_flights_route(itinerary_id: int, access: ItineraryAccess):
    results = get_flights(itinerary_id)
    schema = FlightSchema(many=True)
    return api_response(
        success=True,
        data=schema.dump(results),
        message="Fetched flights.",
        status_code=200,
    )


@flight_bp.route("", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to add flights.",
)
def create_flight_route(itinerary_id: int, access: ItineraryAccess):
    schema = FlightSchema()

    validated_data = schema.load(request.json)
    flight = create_flight(access.user_id, itinerary_id, validated_data)
    return api_response(
        success=True,
        data=schema.dump(flight),
        message="Created flight.",
        status_code=201,
    )


@flight_bp.route("/<int:flight_id>", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
)
def get_flight_route(
    itinerary_id: int, access: ItineraryAccess, flight_id: int
):
    flight = get_flight(itinerary_id, flight_id)
    if not flight:
        return api_response(
            success=False,
            error="Flight not found.",
            message="Flight not found.",
            status_code=404,
        )
    schema = FlightSchema()
    return api_response(
        success=True,
        data=schema.dump(flight),
        message="Fetched flight.",
        status_code=200,
    )


@flight_bp.route("/<int:flight_id>", methods=["PATCH"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to update flights.",
)
def update_flight_route(
    itinerary_id: int, access: ItineraryAccess, flight_id: int
):
    schema = FlightSchema()
    validated_data = schema.load(request.json, partial=True)
    flight = update_flight(
        itinerary_id, flight_id, access.user_id, validated_data
    )
    return api_response(
        success=True,
        data=schema.dump(flight),
        message="Updated flight.",
        status_code=200,
    )


@flight_bp.route("/<int:flight_id>", methods=["DELETE"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to delete flights.",
)
def delete_flight_route(
    itinerary_id: int, access: ItineraryAccess, flight_id: int
):

    deleted_id = delete_flight(itinerary_id, flight_id)
    return api_response(
        success=True,
        data={"deletedId": deleted_id},
        message="Deleted flight.",
        status_code=200,
    )

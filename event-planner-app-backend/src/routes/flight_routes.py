from flask import Blueprint, request

from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..extensions import limiter
from ..schemas.flight_schema import (
    AirportSearchQuerySchema,
    FlightJourneySchema,
    FlightSaveSchema,
    FlightSchema,
    FlightSearchQuerySchema,
    PlaceSchema,
)
from ..schemas.itinerary_schema import UserRole
from ..services.airport_directory import search_places
from ..services.flight_service import (
    create_flight,
    delete_flight,
    get_flight,
    get_flights,
    search_flights,
    update_flight,
)
from ..utils.format_response import api_response
from ..utils.rate_limit import get_user_or_ip

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


@flight_bp.route("/search", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to search for flights.",
)
@limiter.limit("10 per minute;100 per day", key_func=get_user_or_ip)
def search_flights_route(itinerary_id: int, access: ItineraryAccess):
    params = FlightSearchQuerySchema().load(request.args.to_dict())

    journeys = search_flights(
        params["origin"], params["destination"], params["departure_date"]
    )

    return api_response(
        success=True,
        data=FlightJourneySchema(many=True).dump(journeys),
        message="Fetched flights.",
        status_code=200,
    )


@flight_bp.route("/airports", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
)
@limiter.limit("60 per minute", key_func=get_user_or_ip)
def search_airports_route(itinerary_id: int, access: ItineraryAccess):
    params = AirportSearchQuerySchema().load(request.args.to_dict())

    places = search_places(params["q"], params["lat"], params["lng"])

    return api_response(
        success=True,
        data=PlaceSchema(many=True).dump(places),
        message="Fetched airports.",
        status_code=200,
    )


@flight_bp.route("", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to add flights.",
)
def create_flight_route(itinerary_id: int, access: ItineraryAccess):
    validated_data = FlightSaveSchema().load(request.json)

    flights = create_flight(access.user_id, itinerary_id, validated_data)

    return api_response(
        success=True,
        data=FlightSchema(many=True).dump(flights),
        message="Flights saved." if len(flights) > 1 else "Flight saved.",
        status_code=201,
    )


@flight_bp.route("/<int:flight_id>", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
)
def get_flight_route(itinerary_id: int, access: ItineraryAccess, flight_id: int):
    flight = get_flight(itinerary_id, flight_id)

    if not flight:
        return api_response(
            success=False,
            error="Flight not found.",
            message="Flight not found.",
            status_code=404,
        )

    return api_response(
        success=True,
        data=FlightSchema().dump(flight),
        message="Fetched flight.",
        status_code=200,
    )


@flight_bp.route("/<int:flight_id>", methods=["PATCH"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
    message="You must be an admin or an editor to update flights.",
)
def update_flight_route(itinerary_id: int, access: ItineraryAccess, flight_id: int):
    schema = FlightSchema()
    validated_data = schema.load(request.json, partial=True)

    flight = update_flight(itinerary_id, flight_id, access.user_id, validated_data)

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
def delete_flight_route(itinerary_id: int, access: ItineraryAccess, flight_id: int):
    deleted_id = delete_flight(itinerary_id, flight_id)

    return api_response(
        success=True,
        data={"deletedId": deleted_id},
        message="Deleted flight.",
        status_code=200,
    )

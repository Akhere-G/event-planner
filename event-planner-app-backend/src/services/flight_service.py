import logging
from datetime import UTC, date
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..exceptions import (
    BadRequestError,
    FlightProviderError,
    FlightSearchUnavailableError,
    NotFoundError,
)
from ..extensions import cache, db
from ..models import Airport, Flight
from . import expense_service
from .airport_directory import get_airport_info
from .flight_providers import FlightOffer, FlightProviderFactory

logger = logging.getLogger(__name__)

UPDATABLE_FIELDS = ["notes"]
FLIGHT_SEARCH_CACHE_SECONDS = 24 * 60 * 60


def get_flights(itinerary_id: int):
    stmt = (
        select(Flight)
        .options(
            selectinload(Flight.departure_airport),
            selectinload(Flight.arrival_airport),
            expense_service.expense_loader(Flight.expense),
        )
        .where(Flight.itinerary_id == itinerary_id)
        .order_by(Flight.depart_at)
    )
    return db.session.execute(stmt).scalars().all()


def get_flight(itinerary_id: int, flight_id: int):
    stmt = (
        select(Flight)
        .options(
            selectinload(Flight.departure_airport),
            selectinload(Flight.arrival_airport),
            expense_service.expense_loader(Flight.expense),
        )
        .where(
            Flight.itinerary_id == itinerary_id,
            Flight.id == flight_id,
        )
    )
    return db.session.execute(stmt).scalar_one_or_none()


def search_flights(
    origin_codes: list[str], destination_codes: list[str], departure_date: date
) -> list[FlightOffer]:
    origins = sorted({code.upper() for code in origin_codes})
    destinations = sorted({code.upper() for code in destination_codes})
    cache_key = (
        f"flight_search:v2:{','.join(origins)}:{','.join(destinations)}:"
        f"{departure_date.isoformat()}"
    )

    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    for provider in FlightProviderFactory.create_all():
        try:
            offers = provider.search(origins, destinations, departure_date)
        except FlightProviderError:
            logger.exception("%s flight search failed.", provider.name)
            continue

        cache.set(cache_key, offers, timeout=FLIGHT_SEARCH_CACHE_SECONDS)
        return offers

    raise FlightSearchUnavailableError()


def get_or_create_airport(code: str) -> Airport:
    airport = db.session.execute(
        select(Airport).where(Airport.code == code)
    ).scalar_one_or_none()
    if airport:
        return airport

    info = get_airport_info(code)
    if info is None:
        raise BadRequestError(f"Unknown airport {code}.")

    airport = Airport(
        code=info.code,
        name=info.name,
        latitude=info.latitude,
        longitude=info.longitude,
        address=info.address,
        timezone=info.timezone,
    )
    db.session.add(airport)
    db.session.flush()
    return airport


def _local_departure_date(flight: Flight, airport: Airport) -> date:
    # Naive datetimes (MySQL) are always UTC.
    departs_at = flight.depart_at
    if departs_at.tzinfo is None:
        departs_at = departs_at.replace(tzinfo=UTC)
    try:
        zone = ZoneInfo(airport.timezone) if airport.timezone else UTC
    except ZoneInfoNotFoundError:
        zone = UTC
    return departs_at.astimezone(zone).date()


def flight_expense_data(
    flight: Flight, price_gbp: int, departure: Airport, arrival: Airport
) -> dict:
    return {
        "description": (
            f"{flight.airline}{flight.flight_number} · {departure.code} → {arrival.code}"
        ),
        "category": "transport",
        "amount": price_gbp,
        "spent_on": _local_departure_date(flight, departure),
        "flight_id": flight.id,
    }


def stage_flight_expense(
    user_id: int | None,
    flight: Flight,
    price_gbp: int | None,
    departure: Airport,
    arrival: Airport,
):
    """Give a new flight its expense, in the same transaction as the flight.

    A flight with no price, or one saved without a signed-in user (anonymous
    trips have no expenses), starts without an expense.
    """
    if price_gbp is None or user_id is None:
        return None
    return expense_service.stage_create_expense(
        user_id,
        flight.itinerary_id,
        flight_expense_data(flight, price_gbp, departure, arrival),
    )


def create_flight(user_id: int | None, itinerary_id: int, flight_data: dict):
    try:
        airline = flight_data["airline"].upper()
        flight_number = flight_data["flight_number"].upper()

        offers = search_flights(
            flight_data["origin"],
            flight_data["destination"],
            flight_data["departure_date"],
        )
        offer = next(
            (
                offer
                for offer in offers
                if offer.airline == airline and offer.flight_number == flight_number
            ),
            None,
        )
        if offer is None:
            raise NotFoundError("That flight is no longer available for this search.")

        dep_airport = get_or_create_airport(offer.departure_airport)
        arr_airport = get_or_create_airport(offer.arrival_airport)

        stmt = select(Flight).where(
            Flight.itinerary_id == itinerary_id,
            Flight.airline == offer.airline,
            Flight.flight_number == offer.flight_number,
            Flight.depart_at == offer.depart_at,
        )
        flight = db.session.execute(stmt).scalar_one_or_none()
        is_new = flight is None

        if flight:
            flight.updated_by_id = user_id
        else:
            flight = Flight(
                itinerary_id=itinerary_id,
                created_by_id=user_id,
                updated_by_id=user_id,
            )
            db.session.add(flight)

        flight.airline = offer.airline
        flight.flight_number = offer.flight_number
        flight.departure_airport_id = dep_airport.id
        flight.arrival_airport_id = arr_airport.id
        flight.depart_at = offer.depart_at
        flight.arrive_at = offer.arrive_at
        flight.travel_class = offer.travel_class
        flight.luggage = list(offer.luggage)
        flight.extras = list(offer.extras)
        flight.purchase_url = offer.purchase_url
        flight.airline_logo = offer.airline_logo
        flight.notes = flight_data.get("notes")

        # Saving a flight again only refreshes it; a deleted expense stays deleted.
        if is_new:
            db.session.flush()
            stage_flight_expense(
                user_id, flight, offer.price_gbp, dep_airport, arr_airport
            )

        db.session.commit()

    except Exception:
        db.session.rollback()
        raise

    return flight


def update_flight(
    itinerary_id: int, flight_id: int, user_id: int | None, flight_data: dict
):
    try:
        flight = get_flight(itinerary_id, flight_id)
        if not flight:
            raise NotFoundError("Flight not found.")

        for field in UPDATABLE_FIELDS:
            if field in flight_data:
                setattr(flight, field, flight_data[field])

        flight.updated_by_id = user_id
        db.session.commit()

    except Exception:
        db.session.rollback()
        raise

    return flight


def delete_flight(itinerary_id: int, flight_id: int):
    try:
        flight = get_flight(itinerary_id, flight_id)
        if not flight:
            raise NotFoundError("Flight not found.")

        db.session.delete(flight)
        db.session.commit()

    except Exception:
        db.session.rollback()
        raise

    return flight_id

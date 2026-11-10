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
from .flight_providers import FlightJourney, FlightOffer, FlightProviderFactory

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


def _normalise_codes(codes: list[str]) -> list[str]:
    unique_codes = set()
    for code in codes:
        unique_codes.add(code.upper())
    return sorted(unique_codes)


def _search_with_providers(create_providers, cache_key, search):
    """Return the first provider answer, remembering it for a day.

    Providers that fail are skipped. When none can answer, the search is
    unavailable.
    """
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    for provider in create_providers():
        try:
            results = search(provider)
        except FlightProviderError:
            logger.exception("%s flight search failed.", provider.name)
            continue

        cache.set(cache_key, results, timeout=FLIGHT_SEARCH_CACHE_SECONDS)
        return results

    raise FlightSearchUnavailableError()


def search_flights(
    origin_codes: list[str], destination_codes: list[str], departure_date: date
) -> list[FlightJourney]:
    origins = _normalise_codes(origin_codes)
    destinations = _normalise_codes(destination_codes)
    cache_key = (
        f"flight_search:v3:{','.join(origins)}:{','.join(destinations)}:"
        f"{departure_date.isoformat()}"
    )

    return _search_with_providers(
        FlightProviderFactory.create_all,
        cache_key,
        lambda provider: provider.search(origins, destinations, departure_date),
    )


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


def journey_description(journey: FlightJourney) -> str:
    codes = []
    for leg in journey.legs:
        codes.append(f"{leg.airline}{leg.flight_number}")
    origin = journey.first_leg.departure_airport
    destination = journey.last_leg.arrival_airport
    return f"{' + '.join(codes)} · {origin} → {destination}"


def journey_expense_data(first_flight: Flight, journey: FlightJourney) -> dict:
    return {
        "description": journey_description(journey),
        "category": "transport",
        "amount": journey.price_gbp,
        "spent_on": _local_departure_date(first_flight, first_flight.departure_airport),
        "flight_id": first_flight.id,
    }


def stage_journey_expense(
    user_id: int | None, first_flight: Flight, journey: FlightJourney
):
    """Give a new journey its expense, in the same transaction as its flights.

    The expense belongs to the first leg. A journey with no price, or one saved
    without a signed-in user (anonymous trips have no expenses), starts without one.
    """
    if journey.price_gbp is None or user_id is None:
        return None
    return expense_service.stage_create_expense(
        user_id,
        first_flight.itinerary_id,
        journey_expense_data(first_flight, journey),
    )


def find_journey(
    journeys: list[FlightJourney], leg_codes: tuple[tuple[str, str], ...]
) -> FlightJourney | None:
    for journey in journeys:
        if journey.leg_codes == leg_codes:
            return journey
    return None


def _requested_leg_codes(legs: list[dict]) -> tuple[tuple[str, str], ...]:
    codes = []
    for leg in legs:
        codes.append((leg["airline"].upper(), leg["flight_number"].upper()))
    return tuple(codes)


def _find_saved_flight(itinerary_id: int, offer: FlightOffer) -> Flight | None:
    stmt = select(Flight).where(
        Flight.itinerary_id == itinerary_id,
        Flight.airline == offer.airline,
        Flight.flight_number == offer.flight_number,
        Flight.depart_at == offer.depart_at,
    )
    return db.session.execute(stmt).scalar_one_or_none()


def _apply_offer(
    flight: Flight,
    offer: FlightOffer,
    departure: Airport,
    arrival: Airport,
    notes: str | None,
) -> None:
    flight.airline = offer.airline
    flight.flight_number = offer.flight_number
    flight.departure_airport = departure
    flight.arrival_airport = arrival
    flight.depart_at = offer.depart_at
    flight.arrive_at = offer.arrive_at
    flight.travel_class = offer.travel_class
    flight.luggage = list(offer.luggage)
    flight.extras = list(offer.extras)
    flight.purchase_url = offer.purchase_url
    flight.airline_logo = offer.airline_logo
    flight.notes = notes


def _save_offer(
    user_id: int | None, itinerary_id: int, offer: FlightOffer, notes: str | None
) -> tuple[Flight, bool]:
    """Add the offer to the itinerary, or refresh it if already saved.

    Does not commit; the caller owns the transaction.
    """
    # Look airports up first: the query would flush a half-filled new flight.
    departure = get_or_create_airport(offer.departure_airport)
    arrival = get_or_create_airport(offer.arrival_airport)

    flight = _find_saved_flight(itinerary_id, offer)
    is_new = flight is None

    if flight is None:
        flight = Flight(
            itinerary_id=itinerary_id,
            created_by_id=user_id,
            updated_by_id=user_id,
        )
        db.session.add(flight)
    else:
        flight.updated_by_id = user_id

    _apply_offer(flight, offer, departure, arrival, notes)
    db.session.flush()
    return flight, is_new


def _save_journey(
    user_id: int | None,
    itinerary_id: int,
    journey: FlightJourney,
    notes: str | None,
) -> list[Flight]:
    """Save every leg of the journey. Does not commit."""
    flights = []
    first_leg_is_new = False

    for index, leg in enumerate(journey.legs):
        is_first_leg = index == 0
        flight, is_new = _save_offer(
            user_id, itinerary_id, leg, notes if is_first_leg else None
        )
        flights.append(flight)
        if is_first_leg:
            first_leg_is_new = is_new

    # Saving a journey again only refreshes it; a deleted expense stays deleted.
    if first_leg_is_new:
        stage_journey_expense(user_id, flights[0], journey)

    return flights


def create_flight(
    user_id: int | None, itinerary_id: int, flight_data: dict
) -> list[Flight]:
    """Save the searched journey whose legs match `flight_data["legs"]`.

    The journey is looked up again rather than trusted from the client.
    """
    try:
        journeys = search_flights(
            flight_data["origin"],
            flight_data["destination"],
            flight_data["departure_date"],
        )
        journey = find_journey(journeys, _requested_leg_codes(flight_data["legs"]))
        if journey is None:
            raise NotFoundError("That flight is no longer available for this search.")

        flights = _save_journey(
            user_id, itinerary_id, journey, flight_data.get("notes")
        )
        db.session.commit()

    except Exception:
        db.session.rollback()
        raise

    return flights


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

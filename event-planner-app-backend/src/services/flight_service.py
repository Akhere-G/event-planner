from sqlalchemy import select

from ..exceptions import BadRequestError, NotFoundError
from ..extensions import db
from ..models import Flight, ItineraryUser

UPDATABLE_FIELDS = [
    "airline",
    "flight_number",
    "departure_airport",
    "arrival_airport",
    "departure_timezone",
    "arrival_timezone",
    "depart_at",
    "arrive_at",
    "booking_ref",
    "seat",
    "notes",
    "travellers",
]


def get_flights(itinerary_id: int):
    stmt = (
        select(Flight)
        .where(Flight.itinerary_id == itinerary_id)
        .order_by(Flight.depart_at)
    )
    return db.session.execute(stmt).scalars().all()


def get_flight(itinerary_id: int, flight_id: int):
    stmt = select(Flight).where(
        Flight.itinerary_id == itinerary_id, Flight.id == flight_id
    )
    return db.session.execute(stmt).scalar_one_or_none()


def _check_travellers(itinerary_id: int, travellers: list[int]):
    if not travellers:
        return
    stmt = select(ItineraryUser.user_id).where(
        ItineraryUser.itinerary_id == itinerary_id,
        ItineraryUser.user_id.in_(travellers),
    )
    member_ids = set(db.session.execute(stmt).scalars().all())
    if member_ids != set(travellers):
        raise BadRequestError("Travellers must be members of this trip.")


def create_flight(user_id: int | None, itinerary_id: int, flight_data: dict):
    try:
        _check_travellers(itinerary_id, flight_data.get("travellers", []))
        flight = Flight(
            itinerary_id=itinerary_id,
            created_by_id=user_id,
            updated_by_id=user_id,
            **{f: flight_data.get(f) for f in UPDATABLE_FIELDS if f != "travellers"},
            travellers=flight_data.get("travellers", []),
        )
        db.session.add(flight)
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

        depart_at = flight_data.get("depart_at", flight.depart_at)
        arrive_at = flight_data.get("arrive_at", flight.arrive_at)
        if arrive_at.replace(tzinfo=None) <= depart_at.replace(tzinfo=None):
            raise BadRequestError("Arrival must be after departure.")

        if "travellers" in flight_data:
            _check_travellers(itinerary_id, flight_data["travellers"])

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

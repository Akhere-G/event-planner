from sqlalchemy import select

from ..exceptions import BadRequestError
from ..extensions import db
from ..models import Itinerary, TripCalendar
from .client import ClientFactory
from .connections import get_connection
from .watch import stop_watch

CALENDAR_NAME_PREFIX = "TripTrack: "


def get_trip_calendar(user_id: int, itinerary_id: int) -> TripCalendar | None:
    stmt = select(TripCalendar).where(
        TripCalendar.user_id == user_id, TripCalendar.itinerary_id == itinerary_id
    )
    return db.session.execute(stmt).scalar_one_or_none()


def enable_trip_sync(
    user_id: int, itinerary: Itinerary, client_for: ClientFactory
) -> TripCalendar:
    """Creates the user's dedicated Google calendar for the trip, once."""
    existing = get_trip_calendar(user_id, itinerary.id)
    if existing is not None:
        return existing
    if get_connection(user_id) is None:
        raise BadRequestError("Connect Google Calendar first.")

    calendar_id = client_for(user_id).create_calendar(
        f"{CALENDAR_NAME_PREFIX}{itinerary.name}", itinerary.timezone
    )
    trip_calendar = TripCalendar(
        user_id=user_id, itinerary_id=itinerary.id, google_calendar_id=calendar_id
    )
    db.session.add(trip_calendar)
    db.session.commit()
    return trip_calendar


def disable_trip_sync(
    user_id: int, itinerary_id: int, client_for: ClientFactory
) -> None:
    """Stops syncing; the Google calendar itself is left for the user to keep."""
    trip_calendar = get_trip_calendar(user_id, itinerary_id)
    if trip_calendar is None:
        return
    stop_watch(trip_calendar, client_for(user_id))
    db.session.delete(trip_calendar)
    db.session.commit()

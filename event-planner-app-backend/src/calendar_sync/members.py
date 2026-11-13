from sqlalchemy import select

from ..extensions import db
from ..models import ItineraryUser, TripCalendar


def member_role(trip_calendar: TripCalendar) -> str | None:
    """The calendar owner's current role on the trip, or None once they have left."""
    stmt = select(ItineraryUser.role).where(
        ItineraryUser.user_id == trip_calendar.user_id,
        ItineraryUser.itinerary_id == trip_calendar.itinerary_id,
    )
    return db.session.execute(stmt).scalar_one_or_none()


def trip_calendars_for_members(itinerary_id: int) -> list[TripCalendar]:
    """Trip calendars of users who are still members of the trip."""
    stmt = (
        select(TripCalendar)
        .join(
            ItineraryUser,
            (ItineraryUser.user_id == TripCalendar.user_id)
            & (ItineraryUser.itinerary_id == TripCalendar.itinerary_id),
        )
        .where(TripCalendar.itinerary_id == itinerary_id)
    )
    return list(db.session.execute(stmt).scalars())

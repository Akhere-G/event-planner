from datetime import datetime

from sqlalchemy import select

from ..extensions import db
from ..models import CalendarLink, ItineraryUser, TripCalendar
from .client import GoogleEvent


def find_link(
    trip_calendar: TripCalendar, entity: str, entity_id: int
) -> CalendarLink | None:
    stmt = select(CalendarLink).where(
        CalendarLink.trip_calendar_id == trip_calendar.id,
        CalendarLink.entity == entity,
        CalendarLink.entity_id == entity_id,
    )
    return db.session.execute(stmt).scalar_one_or_none()


def find_link_by_google_event(
    trip_calendar: TripCalendar, google_event_id: str
) -> CalendarLink | None:
    stmt = select(CalendarLink).where(
        CalendarLink.trip_calendar_id == trip_calendar.id,
        CalendarLink.google_event_id == google_event_id,
    )
    return db.session.execute(stmt).scalar_one_or_none()


def save_link(
    trip_calendar: TripCalendar,
    link: CalendarLink | None,
    entity: str,
    entity_id: int,
    google_event: GoogleEvent,
    synced_updated_at: datetime,
) -> CalendarLink:
    """Records that a row and a Google event matched at `synced_updated_at`."""
    if link is None:
        link = CalendarLink(
            trip_calendar_id=trip_calendar.id, entity=entity, entity_id=entity_id
        )
        db.session.add(link)
    link.google_event_id = google_event["id"]
    link.etag = google_event["etag"]
    link.updated_at = synced_updated_at
    db.session.flush()
    return link


def trip_calendars_for_members(itinerary_id: int) -> list[tuple[TripCalendar, str]]:
    """Trip calendars of users who are still members, with their current role."""
    stmt = (
        select(TripCalendar, ItineraryUser.role)
        .join(
            ItineraryUser,
            (ItineraryUser.user_id == TripCalendar.user_id)
            & (ItineraryUser.itinerary_id == TripCalendar.itinerary_id),
        )
        .where(TripCalendar.itinerary_id == itinerary_id)
    )
    return [(row[0], row[1]) for row in db.session.execute(stmt)]

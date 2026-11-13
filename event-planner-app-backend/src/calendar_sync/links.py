from typing import Any

from sqlalchemy import select

from ..extensions import db
from ..models import CalendarLink, TripCalendar
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


def record_sync(
    trip_calendar: TripCalendar, entity: str, obj: Any, google_event: GoogleEvent
) -> CalendarLink:
    """Records that a trip row and a Google event matched as of the row's last edit."""
    link = find_link(trip_calendar, entity, obj.id)
    if link is None:
        link = CalendarLink(
            trip_calendar_id=trip_calendar.id, entity=entity, entity_id=obj.id
        )
        db.session.add(link)
    link.google_event_id = google_event["id"]
    link.etag = google_event["etag"]
    link.synced_updated_at = obj.updated_at
    db.session.flush()
    return link

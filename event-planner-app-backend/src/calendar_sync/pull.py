import logging

from sqlalchemy import select

from ..extensions import db
from ..models import CalendarLink, TripCalendar, UserRole
from .client import (
    CalendarClient,
    ClientFactory,
    EventsPage,
    GoogleEvent,
    SyncTokenExpiredError,
)
from .failures import isolate_user_failure
from .links import find_link_by_google_event, record_sync
from .mappers import creation_mapper, get_mapper
from .mappers.times import ensure_utc, parse_google_timestamp
from .members import member_role

logger = logging.getLogger(__name__)

EDIT_ROLES = (UserRole.ADMIN.value, UserRole.EDITOR.value)


def _delete_from_google(trip_calendar: TripCalendar, google_event: GoogleEvent) -> None:
    link = find_link_by_google_event(trip_calendar, google_event["id"])
    if link is None:
        return
    mapper = get_mapper(link.entity)
    obj = mapper.load(link.entity_id)
    # Dropping the link first stops the follow-up push from deleting it again.
    db.session.delete(link)
    if obj is not None and mapper.deletable_from_google:
        mapper.delete(obj)


def _create_from_google(trip_calendar: TripCalendar, google_event: GoogleEvent) -> None:
    mapper = creation_mapper()
    obj = mapper.create_from_google(trip_calendar.itinerary, google_event)
    obj.created_by_id = obj.updated_by_id = trip_calendar.user_id
    db.session.flush()
    record_sync(trip_calendar, mapper.entity, obj, google_event)


def _update_from_google(
    trip_calendar: TripCalendar, google_event: GoogleEvent, link: CalendarLink
) -> None:
    # Our own push comes back as a notification carrying the etag we stored.
    if link.etag == google_event["etag"]:
        return

    mapper = get_mapper(link.entity)
    obj = mapper.load(link.entity_id)
    if obj is None:
        db.session.delete(link)
        return

    # The later edit wins; an app edit newer than Google's was pushed on commit.
    if parse_google_timestamp(google_event["updated"]) <= ensure_utc(obj.updated_at):
        return

    mapper.apply_google(obj, google_event, trip_calendar.itinerary)
    obj.updated_by_id = trip_calendar.user_id
    db.session.flush()
    record_sync(trip_calendar, link.entity, obj, google_event)


def apply_google_event(trip_calendar: TripCalendar, google_event: GoogleEvent) -> None:
    if google_event.get("status") == "cancelled":
        _delete_from_google(trip_calendar, google_event)
        return

    link = find_link_by_google_event(trip_calendar, google_event["id"])
    if link is None:
        _create_from_google(trip_calendar, google_event)
    else:
        _update_from_google(trip_calendar, google_event, link)


def _apply_all(trip_calendar: TripCalendar, events: list[GoogleEvent]) -> None:
    for google_event in events:
        try:
            with db.session.begin_nested():
                apply_google_event(trip_calendar, google_event)
        except Exception:
            logger.exception("Could not apply Google event %s", google_event.get("id"))


def _list_events(trip_calendar: TripCalendar, client: CalendarClient) -> EventsPage:
    try:
        return client.list_events(
            trip_calendar.google_calendar_id, trip_calendar.sync_token
        )
    except SyncTokenExpiredError:
        return client.list_events(trip_calendar.google_calendar_id, None)


def _lock_trip_calendar(trip_calendar_id: int) -> TripCalendar | None:
    """Holds the row until commit so overlapping pulls of one calendar queue up."""
    stmt = (
        select(TripCalendar)
        .where(TripCalendar.id == trip_calendar_id)
        .with_for_update()
    )
    return db.session.execute(stmt).scalar_one_or_none()


def pull_trip_calendar(trip_calendar_id: int, client_for: ClientFactory) -> None:
    """Applies Google-side changes since the last sync to the trip.

    Viewers sync one way: their sync token advances but nothing is applied.
    """
    trip_calendar = _lock_trip_calendar(trip_calendar_id)
    role = member_role(trip_calendar) if trip_calendar else None
    if role is None:
        db.session.commit()
        return

    user_id = trip_calendar.user_id
    with isolate_user_failure(user_id):
        page = _list_events(trip_calendar, client_for(user_id))
        if role in EDIT_ROLES:
            _apply_all(trip_calendar, page.events)
        trip_calendar.sync_token = page.next_sync_token
        db.session.commit()

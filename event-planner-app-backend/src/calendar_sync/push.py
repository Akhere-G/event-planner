import logging
from collections import defaultdict
from typing import Any

from ..extensions import db
from ..models import CalendarLink, TripCalendar
from ..realtime.change_tracker import EntityChange
from .client import CalendarClient, ClientFactory, GoogleEventGoneError
from .failures import handle_user_failure
from .links import find_link, save_link, trip_calendars_for_members
from .mappers import all_mappers, get_mapper
from .mappers.base import EntitySyncMapper
from .mappers.times import ensure_utc

logger = logging.getLogger(__name__)


def _is_in_sync(link: CalendarLink | None, obj: Any) -> bool:
    return link is not None and ensure_utc(link.updated_at) >= ensure_utc(
        obj.updated_at
    )


def upsert_remote(
    trip_calendar: TripCalendar,
    client: CalendarClient,
    mapper: EntitySyncMapper,
    obj: Any,
) -> None:
    link = find_link(trip_calendar, mapper.entity, obj.id)
    if _is_in_sync(link, obj):
        return

    calendar_id = trip_calendar.google_calendar_id
    body = mapper.to_google(obj)
    try:
        if link is None:
            google_event = client.insert_event(calendar_id, body)
        else:
            google_event = client.update_event(calendar_id, link.google_event_id, body)
    except GoogleEventGoneError:
        google_event = client.insert_event(calendar_id, body)

    save_link(trip_calendar, link, mapper.entity, obj.id, google_event, obj.updated_at)


def delete_remote(
    trip_calendar: TripCalendar, client: CalendarClient, entity: str, entity_id: int
) -> None:
    link = find_link(trip_calendar, entity, entity_id)
    if link is None:
        return
    try:
        client.delete_event(trip_calendar.google_calendar_id, link.google_event_id)
    except GoogleEventGoneError:
        pass
    db.session.delete(link)


def push_change(
    trip_calendar: TripCalendar, client: CalendarClient, change: EntityChange
) -> None:
    mapper = get_mapper(change.entity)
    obj = None if change.deleted else mapper.load(change.entity_id)
    if obj is None:
        delete_remote(trip_calendar, client, change.entity, change.entity_id)
    else:
        upsert_remote(trip_calendar, client, mapper, obj)


def push_trip(trip_calendar: TripCalendar, client: CalendarClient) -> None:
    """Pushes every synced row of a trip, used when sync is first switched on."""
    for mapper in all_mappers():
        for obj in mapper.list_for_trip(trip_calendar.itinerary_id):
            upsert_remote(trip_calendar, client, mapper, obj)
    db.session.commit()


def push_changes(changes: list[EntityChange], client_for: ClientFactory) -> None:
    """Mirrors committed changes into every connected member's trip calendar."""
    by_trip: dict[int, list[EntityChange]] = defaultdict(list)
    for change in changes:
        if get_mapper(change.entity):
            by_trip[change.itinerary_id].append(change)

    for itinerary_id, trip_changes in by_trip.items():
        for trip_calendar, _role in trip_calendars_for_members(itinerary_id):
            user_id = trip_calendar.user_id
            try:
                client = client_for(user_id)
                for change in trip_changes:
                    push_change(trip_calendar, client, change)
                db.session.commit()
            except Exception as exc:  # noqa: BLE001 - one user must not block others
                db.session.rollback()
                handle_user_failure(user_id, exc)

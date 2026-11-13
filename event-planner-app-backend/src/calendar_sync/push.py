from collections import defaultdict
from contextlib import suppress
from typing import Any

from ..extensions import db
from ..models import CalendarLink, TripCalendar
from ..realtime import EntityChange
from .client import CalendarClient, ClientFactory, GoogleEventGoneError
from .failures import isolate_user_failure
from .links import find_link, record_sync
from .mappers import all_mappers, get_mapper, has_mapper
from .mappers.base import EntitySyncMapper
from .mappers.times import ensure_utc
from .members import trip_calendars_for_members


def _is_in_sync(link: CalendarLink | None, obj: Any) -> bool:
    return link is not None and ensure_utc(link.synced_updated_at) >= ensure_utc(
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

    record_sync(trip_calendar, mapper.entity, obj, google_event)


def delete_remote(
    trip_calendar: TripCalendar, client: CalendarClient, entity: str, entity_id: int
) -> None:
    link = find_link(trip_calendar, entity, entity_id)
    if link is None:
        return
    with suppress(GoogleEventGoneError):
        client.delete_event(trip_calendar.google_calendar_id, link.google_event_id)
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


def _delete_orphaned_remotes(
    trip_calendar: TripCalendar, client: CalendarClient
) -> None:
    for link in list(trip_calendar.links):
        if get_mapper(link.entity).load(link.entity_id) is None:
            delete_remote(trip_calendar, client, link.entity, link.entity_id)


def push_trip(trip_calendar: TripCalendar, client: CalendarClient) -> None:
    """Brings a trip calendar in line with the trip, whatever pushes were missed."""
    for mapper in all_mappers():
        for obj in mapper.list_for_trip(trip_calendar.itinerary_id):
            upsert_remote(trip_calendar, client, mapper, obj)
    _delete_orphaned_remotes(trip_calendar, client)


def push_changes(changes: list[EntityChange], client_for: ClientFactory) -> None:
    """Mirrors committed changes into every member's trip calendar."""
    by_trip: defaultdict[int, list[EntityChange]] = defaultdict(list)
    for change in changes:
        if has_mapper(change.entity):
            by_trip[change.itinerary_id].append(change)

    for itinerary_id, trip_changes in by_trip.items():
        for trip_calendar in trip_calendars_for_members(itinerary_id):
            user_id = trip_calendar.user_id
            with isolate_user_failure(user_id):
                client = client_for(user_id)
                for change in trip_changes:
                    push_change(trip_calendar, client, change)
                db.session.commit()

from ..extensions import db
from ..models import Event, itinerary_events
from .itineraries_service import get_itinerary
from ..exceptions import (
    ItineraryDoesNotExistError,
    UserNotAuthorisedError,
    EventNotFoundError,
)
from sqlalchemy import select, func


def get_events(itinerary_id: int):
    try:
        results = get_itinerary(itinerary_id)
        return results.events
    except ItineraryDoesNotExistError:
        return []


def create_event(itinerary_id: int, data: dict):
    itinerary = get_itinerary(itinerary_id)

    external_id = data.get("external_id")
    event = None

    if external_id:
        event = db.session.execute(
            select(Event).where(Event.external_id == external_id)
        ).scalar_one_or_none()

    if not event:
        event = Event(**data)
        db.session.add(event)

    if event not in itinerary.events:
        itinerary.events.append(event)

    db.session.commit()
    return event


def update_event(itinerary_id: int, event_id: int, data: dict):
    itinerary = get_itinerary(itinerary_id)

    event = next((e for e in itinerary.events if e.id == event_id), None)

    if not event:
        raise EventNotFoundError()

    if event.external_id is not None:
        raise UserNotAuthorisedError("You cannot edit non custom events.")

    for k, v in data.items():
        if k in [
            "category",
            "description",
            "endTime",
            "location",
            "name",
            "price",
            "start_time",
        ]:
            setattr(event, k, v)

    db.session.commit()
    return event


def delete_event(itinerary_id: int, event_id: int):
    itinerary = get_itinerary(itinerary_id)

    event = next((e for e in itinerary.events if e.id == event_id), None)

    if not event:
        raise EventNotFoundError()

    itinerary.events.remove(event)

    db.session.flush()

    count = db.session.execute(
        select(func.count())
        .select_from(itinerary_events)
        .where(itinerary_events.c.event_id == event.id)
    ).scalar()

    if count == 0:
        db.session.delete(event)
    db.session.commit()

from ..extensions import db
from ..models import Event
from ..schemas.itinerary_schema import UserRole
from .itinerary_controller import get_itinerary
from ..exceptions import (
    ItineraryDoesNotExistError,
    UserNotAuthorisedError,
    EventNotFoundError,
)
from sqlalchemy import select


def get_events(user_id: int, itinerary_id: int):
    try:
        results = get_itinerary(user_id, itinerary_id)
        return results.itinerary.events
    except ItineraryDoesNotExistError:
        return []


def create_event(user_id: int, itinerary_id: int, data: dict):
    result = get_itinerary(user_id, itinerary_id)
    itinerary = result.itinerary

    if result.role not in [UserRole.ADMIN, UserRole.EDITOR]:
        raise UserNotAuthorisedError("You must be an admin or an editor to add events.")

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


def update_event(user_id: int, itinerary_id: int, event_id: int, data: dict):
    result = get_itinerary(user_id, itinerary_id)
    itinerary = result.itinerary

    if result.role not in [UserRole.ADMIN, UserRole.EDITOR]:
        raise UserNotAuthorisedError(
            "You must be an admin or an editor to update events."
        )

    event = next((e for e in itinerary.events if e.id == event_id), None)

    if not event:
        raise EventNotFoundError()

    if event.external_id is not None:
        raise UserNotAuthorisedError("You cannot edit external events.")

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

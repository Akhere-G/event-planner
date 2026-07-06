from ..extensions import db
from ..models import Event, ItineraryEvent
from .itineraries_service import get_itinerary
from ..exceptions import (
    ItineraryDoesNotExistError,
    EventNotFoundError,
)
from marshmallow import ValidationError


def get_events(itinerary_id: int):
    try:
        results = get_itinerary(itinerary_id)
        return results.events
    except ItineraryDoesNotExistError:
        return []


def create_event(itinerary_id: int, data: dict):
    event = Event(**data)
    db.session.add(event)
    db.session.flush()

    itinerary_event = ItineraryEvent(
        itinerary_id=itinerary_id,
        event_id=event.id,
        created_by_id=data["created_by_id"],
        updated_by_id=data["updated_by_id"],
    )

    db.session.add(itinerary_event)

    db.session.commit()
    return event


def create_events(itinerary_id: int, data: list[dict], created_by_id: int):
    try:
        ids = []
        for d in data:
            event = Event(**d)
            db.session.add(event)
            db.session.flush()

            itinerary_event = ItineraryEvent(
                itinerary_id=itinerary_id,
                event_id=event.id,
                created_by_id=created_by_id,
                updated_by_id=created_by_id,
            )

            db.session.add(itinerary_event)
            ids.append(event.id)

        db.session.commit()
        return ids

    except Exception as err:
        db.session.rollback()
        raise err


def update_event(itinerary_id: int, event_id: int, data: dict):
    itinerary = get_itinerary(itinerary_id)

    event = next((e for e in itinerary.events if e.id == event_id), None)

    if not event:
        raise EventNotFoundError()

    for k, v in data.items():
        if k in [
            "category",
            "description",
            "end_at",
            "start_at",
            "edited_by_id",
        ]:
            setattr(event, k, v)

    start = event.start_at
    end = event.end_at

    if end <= start:
        db.session.rollback()
        raise ValidationError({"end_at": ["End time must be after the start time."]})

    db.session.commit()
    return event


def update_events(itinerary_id: int, data: list[dict], updated_by_id: int):
    itinerary = get_itinerary(itinerary_id)
    updated_events: list[Event] = []
    try:
        for d in data:
            event = next((e for e in itinerary.events if e.id == d["id"]), None)

            if not event:
                raise EventNotFoundError()

            for k, v in d.items():
                if k in [
                    "category",
                    "description",
                    "end_at",
                    "start_at",
                ]:
                    setattr(event, k, v)

            start = event.start_at
            end = event.end_at

            if end <= start:
                db.session.rollback()
                raise ValidationError(
                    {"end_at": ["End time must be after the start time."]}
                )
            event.updated_by_id = updated_by_id
            updated_events.append(event)

        db.session.commit()
        return updated_events
    except Exception as err:
        db.session.rollback()
        raise err


def delete_event(itinerary_id: int, event_id: int):
    itinerary = get_itinerary(itinerary_id)

    event = next((e for e in itinerary.events if e.id == event_id), None)

    if not event:
        raise EventNotFoundError()

    itinerary.events.remove(event)
    db.session.delete(event)
    db.session.commit()

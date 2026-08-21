from marshmallow import ValidationError
from sqlalchemy import select

from ..exceptions import (
    EventNotFoundError,
)
from ..extensions import db
from ..models import Event
from .itineraries_service import get_itinerary


def get_event(itinerary_id: int, event_id: int):
    stmt = select(Event).where(
        Event.itinerary_id == itinerary_id,
        Event.id == event_id,
    )

    return db.session.execute(stmt).scalar_one_or_none()


def get_events(itinerary_id: int):
    stmt = select(Event).where(Event.itinerary_id == itinerary_id)

    results = db.session.execute(stmt).scalars().all()
    return results


def create_event(itinerary_id: int, data: dict):
    try:
        event = Event(**data, itinerary_id=itinerary_id)
        db.session.add(event)
        db.session.commit()
        return event
    except Exception:
        db.session.rollback()
        raise


def create_events(itinerary_id: int, data: list[dict], created_by_id: int):
    try:
        ids = []
        for d in data:
            event_data = {
                **d,
                "created_by_id": created_by_id,
                "updated_by_id": created_by_id,
                "itinerary_id": itinerary_id,
            }
            event = Event(**event_data)
            db.session.add(event)
            db.session.flush()

            ids.append(event.id)

        db.session.commit()
        return ids

    except Exception:
        db.session.rollback()
        raise


def update_event(itinerary_id: int, event_id: int, data: dict):
    try:
        event = get_event(itinerary_id, event_id)

        if not event:
            raise EventNotFoundError()

        for k, v in data.items():
            if k in [
                "name",
                "address",
                "longitude",
                "latitude",
                "category",
                "description",
                "end_at",
                "start_at",
                "updated_by_id",
            ]:
                setattr(event, k, v)

        start = event.start_at
        end = event.end_at

        if end <= start:
            raise ValidationError(
                {"end_at": ["End time must be after the start time."]}
            )

        db.session.commit()
        return event
    except Exception:
        db.session.rollback()
        raise


def update_events(itinerary_id: int, data: list[dict], updated_by_id: int):
    updated_events: list[Event] = []
    try:
        for d in data:
            event = get_event(itinerary_id, d["id"])

            if not event:
                raise EventNotFoundError()

            for k, v in d.items():
                if k in [
                    "name",
                    "address",
                    "longitude",
                    "latitude",
                    "category",
                    "description",
                    "end_at",
                    "start_at",
                ]:
                    setattr(event, k, v)

            start = event.start_at
            end = event.end_at

            if end <= start:
                raise ValidationError(
                    {"end_at": ["End time must be after the start time."]}
                )
            event.updated_by_id = updated_by_id
            updated_events.append(event)

        db.session.commit()
        return updated_events
    except Exception:
        db.session.rollback()
        raise


def delete_event(itinerary_id: int, event_id: int):
    itinerary = get_itinerary(itinerary_id)

    event = get_event(itinerary_id, event_id)

    if not event:
        raise EventNotFoundError()

    itinerary.events.remove(event)
    db.session.delete(event)
    db.session.commit()

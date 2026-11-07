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


def stage_create_event(itinerary_id: int, data: dict):
    event = Event(**data, itinerary_id=itinerary_id)
    db.session.add(event)
    db.session.flush()
    return event


def create_event(itinerary_id: int, data: dict):
    try:
        event = stage_create_event(itinerary_id, data)
        db.session.commit()
        return event
    except Exception:
        db.session.rollback()
        raise


def create_events(itinerary_id: int, data: list[dict], created_by_id: int | None):
    try:
        ids = [
            stage_create_event(
                itinerary_id,
                {**d, "created_by_id": created_by_id, "updated_by_id": created_by_id},
            ).id
            for d in data
        ]
        db.session.commit()
        return ids
    except Exception:
        db.session.rollback()
        raise


UPDATABLE_EVENT_FIELDS = [
    "name",
    "address",
    "longitude",
    "latitude",
    "category",
    "description",
    "end_at",
    "start_at",
    "estimated_cost_gbp",
    "price_tier",
]


def stage_update_event(
    itinerary_id: int, event_id: int, data: dict, updated_by_id: int | None
):
    event = get_event(itinerary_id, event_id)

    if not event:
        raise EventNotFoundError()

    for k, v in data.items():
        if k in UPDATABLE_EVENT_FIELDS:
            setattr(event, k, v)

    if event.end_at <= event.start_at:
        raise ValidationError({"end_at": ["End time must be after the start time."]})

    event.updated_by_id = updated_by_id
    db.session.flush()
    return event


def update_event(itinerary_id: int, event_id: int, data: dict):
    try:
        event = stage_update_event(
            itinerary_id, event_id, data, data.get("updated_by_id")
        )
        db.session.commit()
        return event
    except Exception:
        db.session.rollback()
        raise


def update_events(itinerary_id: int, data: list[dict], updated_by_id: int | None):
    try:
        updated_events = [
            stage_update_event(itinerary_id, d["id"], d, updated_by_id) for d in data
        ]
        db.session.commit()
        return updated_events
    except Exception:
        db.session.rollback()
        raise


def stage_delete_event(itinerary_id: int, event_id: int):
    event = get_event(itinerary_id, event_id)

    if not event:
        raise EventNotFoundError()

    itinerary = get_itinerary(itinerary_id)
    itinerary.events.remove(event)
    db.session.delete(event)
    db.session.flush()


def delete_event(itinerary_id: int, event_id: int):
    try:
        stage_delete_event(itinerary_id, event_id)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

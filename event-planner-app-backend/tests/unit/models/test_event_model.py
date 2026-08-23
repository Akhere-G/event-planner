from datetime import datetime

from sqlalchemy import select
from src.extensions import db
from src.models import Event


def test_event_creation(event):
    assert isinstance(event, Event)
    assert event.name == "Event 0"
    assert event.address == "123 Test St"
    assert event.latitude == 40.7128
    assert event.longitude == -74.0060
    assert event.description == "Sample event"
    assert event.start_at == datetime(2026, 8, 20, 10, 0)
    assert event.end_at == datetime(2026, 8, 20, 12, 0)
    assert event.category == "food"


def test_event_has_audit_fields(admin_user, event):
    assert event.created_at is not None
    assert event.updated_at is not None
    assert event.updated_by_id == admin_user.id
    assert event.created_by_id == admin_user.id


def test_event_belongs_to_itinerary(event, itinerary):
    assert event.itinerary_id == itinerary.id
    assert event.itinerary == itinerary


def test_event_cascade_when_itinerary_deleted(itinerary, event):
    event_id = event.id
    db.session.delete(itinerary)
    db.session.flush()

    stmt = select(Event).where(Event.id == event_id)

    result = db.session.execute(stmt).scalar_one_or_none()

    assert result is None

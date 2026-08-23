from datetime import date

from src.models import Itinerary


def test_itinerary_creation(itinerary):
    assert isinstance(itinerary, Itinerary)
    assert itinerary.name == "Trip 0"
    assert itinerary.destination == "Paris"
    assert itinerary.latitude == 48.8566
    assert itinerary.longitude == 2.3522
    assert itinerary.description == "Sample trip"
    assert itinerary.start_date == date(2026, 8, 1)
    assert itinerary.end_date == date(2026, 8, 3)
    assert itinerary.viewer_code is not None
    assert itinerary.admin_code is not None
    assert itinerary.editor_code is not None


def test_itinerary_has_audit_fields(admin_user, itinerary):
    assert itinerary.created_at is not None
    assert itinerary.updated_at is not None
    assert itinerary.updated_by_id == admin_user.id
    assert itinerary.created_by_id == admin_user.id

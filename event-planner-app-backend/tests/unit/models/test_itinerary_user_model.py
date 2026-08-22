from sqlalchemy import select
from src.extensions import db
from src.models import ItineraryUser, UserRole


def test_itinerary_user_creation(user, itinerary, itinerary_user):
    assert itinerary_user.user_id == user.id
    assert itinerary_user.itinerary_id == itinerary.id

    assert itinerary_user.user == user
    assert itinerary_user.itinerary == itinerary
    assert itinerary_user.role == UserRole.VIEWER.value


def test_itinerary_user_cascade_when_user_deleted(user, itinerary, itinerary_user):
    db.session.delete(user)
    db.session.flush()

    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary.id)
        .where(ItineraryUser.user_id == user.id)
    )
    result = db.session.execute(stmt).scalar_one_or_none()

    assert result is None


def test_itinerary_user_cascade_when_itinerary_deleted(user, itinerary, itinerary_user):
    db.session.delete(itinerary)
    db.session.flush()

    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary.id)
        .where(ItineraryUser.user_id == user.id)
    )
    result = db.session.execute(stmt).scalar_one_or_none()

    assert result is None


def test_user_role_has_value():
    assert UserRole.has_value("admin")
    assert UserRole.has_value("editor")
    assert UserRole.has_value("viewer")

    assert not UserRole.has_value("invalid")

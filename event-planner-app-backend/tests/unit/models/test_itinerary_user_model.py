import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from src.extensions import db
from src.models import ItineraryUser, UserRole


def test_itinerary_user_creation(admin_user, itinerary, admin_itinerary_user):
    assert admin_itinerary_user.user_id == admin_user.id
    assert admin_itinerary_user.itinerary_id == itinerary.id

    assert admin_itinerary_user.user == admin_user
    assert admin_itinerary_user.itinerary == itinerary
    assert admin_itinerary_user.role == UserRole.ADMIN.value


def test_itinerary_user_has_audit_fields(admin_user, admin_itinerary_user):
    assert admin_itinerary_user.created_at is not None
    assert admin_itinerary_user.updated_at is not None
    assert admin_itinerary_user.updated_by_id == admin_user.id
    assert admin_itinerary_user.created_by_id == admin_user.id


def test_itinerary_user_cascade_when_user_deleted(
    admin_user, itinerary, admin_itinerary_user
):
    db.session.delete(admin_user)
    db.session.flush()

    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary.id)
        .where(ItineraryUser.user_id == admin_user.id)
    )
    result = db.session.execute(stmt).scalar_one_or_none()

    assert result is None


def test_itinerary_user_cascade_when_itinerary_deleted(
    admin_user, itinerary, admin_itinerary_user
):
    db.session.delete(itinerary)
    db.session.flush()

    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary.id)
        .where(ItineraryUser.user_id == admin_user.id)
    )
    result = db.session.execute(stmt).scalar_one_or_none()

    assert result is None


def test_user_role_has_value():
    assert UserRole.has_value("admin")
    assert UserRole.has_value("editor")
    assert UserRole.has_value("viewer")

    assert not UserRole.has_value("invalid")


def test_duplicate_itinerary_user_is_rejected(
    admin_user,
    itinerary,
    admin_itinerary_user,
):
    with pytest.raises(IntegrityError):
        duplicate = ItineraryUser(
            itinerary_id=itinerary.id,
            user_id=admin_user.id,
            role=UserRole.VIEWER.value,
        )

        db.session.add(duplicate)

        db.session.flush()

import pytest
from sqlalchemy.exc import IntegrityError
from src.extensions import db
from src.models import User
from tests.factories import UserFactory


def test_user_creation(user):
    assert isinstance(user, User)
    assert user.id is not None
    assert user.username.startswith("user")
    assert user.email.startswith("user")
    assert user.password == "password123"


def test_users_have_unique_emails(user):
    with pytest.raises(IntegrityError):  # IntegrityError for duplicate email
        UserFactory(email=user.email)
        db.session.commit()


def test_user_has_timestamps(user):
    assert user.created_at is not None
    assert user.updated_at is not None


def test_user_can_have_itinerary_membership(user, itinerary_user):
    assert itinerary_user.user_id == user.id
    assert itinerary_user.user == user
    assert itinerary_user in user.itinerary_memberships

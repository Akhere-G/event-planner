import pytest
from sqlalchemy.exc import IntegrityError
from src.extensions import bcrypt, db
from src.models import User
from tests.factories import UserFactory


def test_user_creation(admin_user):
    assert isinstance(admin_user, User)
    assert admin_user.id is not None
    assert admin_user.username.startswith("user")
    assert admin_user.email.startswith("user")
    assert bcrypt.check_password_hash(admin_user.password, "password123")


def test_users_have_unique_emails(admin_user):
    with pytest.raises(IntegrityError):  # IntegrityError for duplicate email
        UserFactory(email=admin_user.email)


def test_user_has_timestamps(admin_user):
    assert admin_user.created_at is not None
    assert admin_user.updated_at is not None


def test_user_can_have_itinerary_membership(admin_user, admin_itinerary_user):
    assert admin_itinerary_user.user_id == admin_user.id
    assert admin_itinerary_user.user == admin_user
    assert admin_itinerary_user in admin_user.itinerary_memberships

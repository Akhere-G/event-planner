import pytest
from src.exceptions import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
)
from src.extensions import bcrypt, db
from src.models import User
from src.services.auth_service import login_user, register_user
from tests.factories import UserFactory


def test_register_user_success(app):
    user_id = register_user("newuser", "newuser@example.com", "securepassword123")
    assert user_id is not None

    db_user = db.session.get(User, user_id)
    assert db_user is not None
    assert db_user.username == "newuser"
    assert db_user.email == "newuser@example.com"
    assert bcrypt.check_password_hash(db_user.password, "securepassword123")


def test_register_user_email_normalization(app):
    user_id = register_user("normalizer", "   TestUser@EXAMPLE.Com   ", "password123")
    db_user = db.session.get(User, user_id)

    assert db_user is not None
    assert db_user.email == "testuser@example.com"


def test_register_user_already_exists(app, admin_user):
    with pytest.raises(UserAlreadyExistsError):
        register_user("duplicate", admin_user.email, "password123")


def test_login_user_success(app):
    password_hash = bcrypt.generate_password_hash("mysecretpassword").decode("utf-8")
    existing_user = UserFactory(email="loginuser@example.com", password=password_hash)

    user_id = login_user("loginuser@example.com", "mysecretpassword")
    assert user_id == existing_user.id


def test_login_user_email_case_and_whitespace_insensitive(app):
    password_hash = bcrypt.generate_password_hash("mysecretpassword").decode("utf-8")
    existing_user = UserFactory(email="loginuser@example.com", password=password_hash)
    db.session.commit()
    user_id = login_user("  LOGINUSER@EXAMPLE.COM  ", "mysecretpassword")
    assert user_id == existing_user.id


def test_login_user_non_existent_email(app):
    with pytest.raises(InvalidCredentialsError) as exc_info:
        login_user("nonexistent@example.com", "password123")

    assert exc_info.value.message == "Invalid credentials."


def test_login_user_invalid_password(app):
    password_hash = bcrypt.generate_password_hash("mysecretpassword").decode("utf-8")
    UserFactory(email="loginuser@example.com", password=password_hash)

    with pytest.raises(InvalidCredentialsError):
        login_user("loginuser@example.com", "wrongpassword")

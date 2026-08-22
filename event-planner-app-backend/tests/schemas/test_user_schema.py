# tests/schemas/test_user_schema.py

import pytest
from marshmallow import ValidationError
from src.schemas.user_schema import (
    AddOrUpdateUserRoleSchema,
    LoginSchema,
    RegisterSchema,
    UserWithRoleSchema,
)


def test_login_schema_loads_valid_data():
    result = LoginSchema().load(
        {
            "email": "test@example.com",
            "password": "password123",
        }
    )

    assert result["email"] == "test@example.com"
    assert result["password"] == "password123"


def test_login_schema_requires_email_and_password():
    with pytest.raises(ValidationError):
        LoginSchema().load({})


def test_register_schema_loads_valid_data():
    result = RegisterSchema().load(
        {
            "username": "ak",
            "email": "test@example.com",
            "password": "password123",
            "repeatPassword": "password123",
        }
    )

    assert result["username"] == "ak"
    assert result["email"] == "test@example.com"
    assert result["password"] == "password123"


@pytest.mark.parametrize(
    "password",
    [
        "short1",
        "password",
        "12345678",
    ],
)
def test_register_schema_rejects_invalid_password(password):
    with pytest.raises(ValidationError):
        RegisterSchema().load(
            {
                "username": "ak",
                "email": "test@example.com",
                "password": password,
                "repeatPassword": password,
            }
        )


def test_register_schema_rejects_mismatched_passwords():
    with pytest.raises(ValidationError) as exc_info:
        RegisterSchema().load(
            {
                "username": "ak",
                "email": "test@example.com",
                "password": "password123",
                "repeatPassword": "different123",
            }
        )

    assert "repeat_password" in exc_info.value.messages


@pytest.mark.parametrize("role", ["admin", "editor", "viewer"])
def test_user_with_role_accepts_valid_role(role, user):
    result = UserWithRoleSchema().dump(
        {
            "user": user,
            "role": role,
        }
    )

    assert result["role"] == role
    assert result["username"] == user.username


def test_user_with_role_rejects_invalid_role():
    with pytest.raises(ValidationError):
        UserWithRoleSchema().load({"role": "invalid"})


def test_add_or_update_user_role_schema_validates_role_and_email():
    result = AddOrUpdateUserRoleSchema().load(
        {
            "email": "test@example.com",
            "role": "editor",
        }
    )

    assert result["email"] == "test@example.com"
    assert result["role"] == "editor"


def test_add_or_update_user_role_schema_rejects_invalid_role():
    with pytest.raises(ValidationError):
        AddOrUpdateUserRoleSchema().load(
            {
                "email": "test@example.com",
                "role": "invalid",
            }
        )

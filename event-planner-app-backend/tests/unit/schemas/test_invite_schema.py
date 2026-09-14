from datetime import datetime, timedelta, timezone

import pytest
from marshmallow import ValidationError
from src.models import InvitationStatus, UserRole
from src.schemas.invite_schema import InviteSchema, InviteSchemaPrivate

VALID_INVITE_DATA = {
    "email": "user@example.com",
    "role": UserRole.VIEWER.value,
}


def test_invite_schema_loads_valid_data():
    result = InviteSchema().load(VALID_INVITE_DATA)

    assert result["email"] == "user@example.com"
    assert result["role"] == UserRole.VIEWER.value


def test_invite_schema_uses_viewer_as_default_role():
    data = {
        "email": "user@example.com",
    }

    result = InviteSchema().load(data)

    assert result["role"] == UserRole.VIEWER.value


def test_invite_schema_requires_email():
    data = VALID_INVITE_DATA.copy()
    data.pop("email")

    with pytest.raises(ValidationError) as exc_info:
        InviteSchema().load(data)

    assert "email" in exc_info.value.messages


@pytest.mark.parametrize(
    "role",
    [role.value for role in UserRole],
)
def test_invite_schema_accepts_valid_roles(role):
    data = {
        **VALID_INVITE_DATA,
        "role": role,
    }

    result = InviteSchema().load(data)

    assert result["role"] == role


def test_invite_schema_rejects_invalid_role():
    data = {
        **VALID_INVITE_DATA,
        "role": "invalid",
    }

    with pytest.raises(ValidationError) as exc_info:
        InviteSchema().load(data)

    assert "role" in exc_info.value.messages


@pytest.mark.parametrize(
    "email",
    [
        "not-an-email",
        "user",
        "user@",
        "@example.com",
    ],
)
def test_invite_schema_rejects_invalid_email(email):
    data = {
        **VALID_INVITE_DATA,
        "email": email,
    }

    with pytest.raises(ValidationError) as exc_info:
        InviteSchema().load(data)

    assert "email" in exc_info.value.messages


def test_invite_schema_rejects_dump_only_fields():
    data = {
        **VALID_INVITE_DATA,
        "id": 123,
        "itinerary_id": 456,
        "inviter_id": 789,
        "status": InvitationStatus.PENDING.value,
        "token": "test-token",
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
    }

    with pytest.raises(ValidationError) as exc_info:
        InviteSchema().load(data)

    assert "id" in exc_info.value.messages
    assert "itinerary_id" in exc_info.value.messages
    assert "inviter_id" in exc_info.value.messages
    assert "status" in exc_info.value.messages
    assert "token" in exc_info.value.messages
    assert "expires_at" in exc_info.value.messages


def test_invite_schema_private_loads_valid_data():
    result = InviteSchemaPrivate().load(VALID_INVITE_DATA)

    assert result["email"] == "user@example.com"
    assert result["role"] == UserRole.VIEWER.value


def test_invite_schema_private_uses_viewer_as_default_role():
    data = {
        "email": "user@example.com",
    }

    result = InviteSchemaPrivate().load(data)

    assert result["role"] == UserRole.VIEWER.value


def test_invite_schema_private_requires_email():
    data = VALID_INVITE_DATA.copy()
    data.pop("email")

    with pytest.raises(ValidationError) as exc_info:
        InviteSchemaPrivate().load(data)

    assert "email" in exc_info.value.messages


@pytest.mark.parametrize(
    "role",
    [role.value for role in UserRole],
)
def test_invite_schema_private_accepts_valid_roles(role):
    data = {
        **VALID_INVITE_DATA,
        "role": role,
    }

    result = InviteSchemaPrivate().load(data)

    assert result["role"] == role


def test_invite_schema_private_rejects_invalid_role():
    data = {
        **VALID_INVITE_DATA,
        "role": "invalid",
    }

    with pytest.raises(ValidationError) as exc_info:
        InviteSchemaPrivate().load(data)

    assert "role" in exc_info.value.messages


@pytest.mark.parametrize(
    "email",
    [
        "not-an-email",
        "user",
        "user@",
        "@example.com",
    ],
)
def test_invite_schema_private_rejects_invalid_email(email):
    data = {
        **VALID_INVITE_DATA,
        "email": email,
    }

    with pytest.raises(ValidationError) as exc_info:
        InviteSchemaPrivate().load(data)

    assert "email" in exc_info.value.messages


def test_invite_schema_private_rejects_dump_only_fields():
    data = {
        **VALID_INVITE_DATA,
        "id": 123,
        "inviter_id": 789,
        "status": InvitationStatus.PENDING.value,
    }

    with pytest.raises(ValidationError) as exc_info:
        InviteSchemaPrivate().load(data)

    assert "id" in exc_info.value.messages
    assert "inviter_id" in exc_info.value.messages
    assert "status" in exc_info.value.messages

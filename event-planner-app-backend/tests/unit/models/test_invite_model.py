import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from src.extensions import db
from src.models import InvitationStatus, Invite, UserRole
from tests.factories import InviteFactory


def test_invite_creation(invite, user, uninvited_user):
    assert isinstance(invite, Invite)
    assert invite.email == uninvited_user.email
    assert invite.inviter_id == user.id
    assert invite.role == UserRole.VIEWER.value
    assert invite.status == InvitationStatus.PENDING.value
    assert invite.token is not None
    assert invite.expires_at is not None


def test_invite_has_audit_fields(user, invite):
    assert invite.created_at is not None
    assert invite.updated_at is not None
    assert invite.updated_by_id == user.id
    assert invite.created_by_id == user.id


def test_invite_belongs_to_itinerary(invite, itinerary):
    assert invite.itinerary_id == itinerary.id
    assert invite.itinerary == itinerary


def test_duplicate_invite_is_rejected(invite, user, itinerary, uninvited_user):
    with pytest.raises(IntegrityError):
        duplicate = InviteFactory(
            itinerary=itinerary, creator=user, email=uninvited_user.email
        )
        db.session.flush(duplicate)


def test_invite_cascade_when_itinerary_deleted(itinerary, invite):
    invite_id = invite.id

    db.session.delete(itinerary)
    db.session.flush()

    stmt = select(Invite).where(Invite.id == invite_id)

    result = db.session.execute(stmt).scalar_one_or_none()

    assert result is None

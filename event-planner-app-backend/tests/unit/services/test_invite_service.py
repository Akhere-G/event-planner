from datetime import datetime, timedelta, timezone

import pytest
from src.exceptions import (
    BadRequestError,
    InviteNotFoundError,
    ItineraryDoesNotExistError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
)
from src.extensions import db
from src.models import InvitationStatus, Invite, UserRole
from src.services.invite_service import (
    accept_invite,
    create_invite,
    decline_invite,
    get_invite,
    get_invites,
    get_user_invite,
    get_user_invites,
    join_itinerary,
    revoke_invite,
)
from tests.factories import InviteFactory, ItineraryUserFactory, UserFactory


def test_get_invite_by_id(invite):
    result = get_invite(invite.itinerary_id, invite_id=invite.id)
    assert result is not None
    assert result.id == invite.id


def test_get_invite_by_email(invite):
    result = get_invite(invite.itinerary_id, email=invite.email)
    assert result is not None
    assert result.email == invite.email


def test_get_invite_not_found(itinerary):
    result = get_invite(itinerary.id, invite_id=99999)
    assert result is None


def test_get_invite_no_params(itinerary):
    result = get_invite(itinerary.id)
    assert result is None


def test_get_user_invites(invited_user, invite):
    invites = get_user_invites(invited_user.id)
    assert len(invites) == 1
    assert invites[0].id == invite.id


def test_get_user_invites_empty(admin_user):
    invites = get_user_invites(admin_user.id)
    assert invites == []


def test_get_invites(itinerary, invite):
    invites = get_invites(itinerary.id)
    assert len(invites) == 1
    assert invites[0].id == invite.id


def test_get_invites_empty(itinerary):
    invites = get_invites(itinerary.id)
    assert invites == []


def test_create_invite_success(admin_user, itinerary, invited_user):
    invite_data = {
        "email": invited_user.email,
        "itinerary_id": itinerary.id,
        "role": UserRole.VIEWER.value,
        "inviter_id": admin_user.id,
        "created_by_id": admin_user.id,
        "updated_by_id": admin_user.id,
    }

    invite = create_invite(invite_data)
    assert invite.id is not None
    assert invite.email == invited_user.email
    assert invite.status == InvitationStatus.PENDING.value


def test_create_invite_user_already_member(admin_user, itinerary, admin_itinerary_user):
    invite_data = {
        "email": admin_user.email,
        "itinerary_id": itinerary.id,
        "role": UserRole.VIEWER.value,
        "inviter_id": admin_user.id,
        "created_by_id": admin_user.id,
        "updated_by_id": admin_user.id,
    }

    with pytest.raises(UserAlreadyExistsError):
        create_invite(invite_data)


def test_create_invite_existing_pending(admin_user, itinerary, invite):
    invite_data = {
        "email": invite.email,
        "itinerary_id": itinerary.id,
        "role": UserRole.EDITOR.value,
        "inviter_id": admin_user.id,
        "created_by_id": admin_user.id,
        "updated_by_id": admin_user.id,
    }

    updated_invite = create_invite(invite_data)
    assert updated_invite.id == invite.id
    assert updated_invite.role == UserRole.EDITOR.value
    assert updated_invite.status == InvitationStatus.PENDING.value


def test_create_invite_existing_accepted(admin_user, itinerary):

    invite = Invite(
        email=admin_user.email,
        itinerary_id=itinerary.id,
        role=UserRole.VIEWER.value,
        status=InvitationStatus.ACCEPTED.value,
        inviter_id=admin_user.id,
        created_by_id=admin_user.id,
        updated_by_id=admin_user.id,
    )
    db.session.add(invite)
    db.session.flush()

    invite_data = {
        "email": admin_user.email,
        "itinerary_id": itinerary.id,
        "role": UserRole.VIEWER.value,
        "inviter_id": admin_user.id,
        "created_by_id": admin_user.id,
        "updated_by_id": admin_user.id,
    }

    with pytest.raises(UserAlreadyExistsError):
        create_invite(invite_data)


def test_revoke_invite_success(admin_user, invite):
    revoked = revoke_invite(admin_user.id, invite.itinerary_id, invite.id)
    assert revoked.status == InvitationStatus.REVOKED.value
    assert revoked.updated_by_id == admin_user.id


def test_revoke_invite_already_accepted(admin_user, invite):
    invite.status = InvitationStatus.ACCEPTED.value

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        revoke_invite(admin_user.id, invite.itinerary_id, invite.id)
    assert "already been accepted" in str(exc_info.value)


def test_revoke_invite_already_declined(admin_user, invite):
    invite.status = InvitationStatus.DECLINED.value

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        revoke_invite(admin_user.id, invite.itinerary_id, invite.id)
    assert "already been declined" in str(exc_info.value)


def test_revoke_invite_not_found(admin_user, itinerary):
    with pytest.raises(InviteNotFoundError):
        revoke_invite(admin_user.id, itinerary.id, 99999)


def test_get_user_invite_success(invited_user, invite):
    result = get_user_invite(invited_user.id, invite.token)
    assert result is not None
    assert result.id == invite.id


def test_get_user_invite_not_found(admin_user):
    with pytest.raises(InviteNotFoundError):
        get_user_invite(admin_user.id, "invalid_token")


def test_accept_invite_success(invited_user, invite):
    membership = accept_invite(invited_user.id, invite.token)
    assert membership is not None
    assert membership.user_id == invited_user.id
    assert membership.itinerary_id == invite.itinerary_id

    db.session.refresh(invite)
    assert invite.status == InvitationStatus.ACCEPTED.value


def test_accept_invite_expired(invited_user, invite):
    invite.expires_at = datetime.now(timezone.utc) - timedelta(days=1)

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        accept_invite(invited_user.id, invite.token)
    assert "expired" in str(exc_info.value).lower()


def test_accept_invite_already_accepted(invited_user, invite):
    invite.status = InvitationStatus.ACCEPTED.value

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        accept_invite(invited_user.id, invite.token)
    assert "already been accepted" in str(exc_info.value)


def test_accept_invite_already_declined(invited_user, invite):
    invite.status = InvitationStatus.DECLINED.value

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        accept_invite(invited_user.id, invite.token)
    assert "already been declined" in str(exc_info.value)


def test_accept_invite_revoked(invited_user, invite):
    invite.status = InvitationStatus.REVOKED.value

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        accept_invite(invited_user.id, invite.token)
    assert "revoked" in str(exc_info.value).lower()


def test_decline_invite_success(invited_user, invite):
    declined = decline_invite(invited_user.id, invite.token)
    assert declined.status == InvitationStatus.DECLINED.value
    assert declined.updated_by_id == invited_user.id


def test_decline_invite_already_accepted(invited_user, invite):
    invite.status = InvitationStatus.ACCEPTED.value

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        decline_invite(invited_user.id, invite.token)
    assert "already been accepted" in str(exc_info.value)


def test_decline_invite_already_declined(invited_user, invite):
    invite.status = InvitationStatus.DECLINED.value

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        decline_invite(invited_user.id, invite.token)
    assert "already been declined" in str(exc_info.value)


def test_decline_invite_revoked(invited_user, invite):
    invite.status = InvitationStatus.REVOKED.value

    db.session.flush()

    with pytest.raises(BadRequestError) as exc_info:
        decline_invite(invited_user.id, invite.token)
    assert "revoked" in str(exc_info.value).lower()


def test_join_itinerary_user_made(admin_user, itinerary):
    with pytest.raises(UserAlreadyExistsError) as exc_info:
        join_itinerary(admin_user.id, itinerary.viewer_code)
    assert str(exc_info.value) == "This is the trip you created!"


def test_join_itinerary_viewer_code(admin_user, invited_user, itinerary):
    invite = join_itinerary(invited_user.id, itinerary.viewer_code)
    assert invite is not None
    assert invite.email is not None
    assert invite.role == UserRole.VIEWER.value


def test_join_itinerary_editor_code(admin_user, invited_user, itinerary):
    invite = join_itinerary(invited_user.id, itinerary.editor_code)
    assert invite is not None
    assert invite.role == UserRole.EDITOR.value


def test_join_itinerary_admin_code(admin_user, invited_user, itinerary):
    invite = join_itinerary(invited_user.id, itinerary.admin_code)
    assert invite is not None
    assert invite.role == UserRole.ADMIN.value


def test_join_itinerary_user_not_found(itinerary):
    with pytest.raises(UserDoesNotExistError):
        join_itinerary(99999, itinerary.viewer_code)


def test_join_itinerary_invalid_code(admin_user):
    with pytest.raises(ItineraryDoesNotExistError):
        join_itinerary(admin_user.id, "invalid_code")


def test_join_itinerary_already_member(admin_user, itinerary, admin_itinerary_user):
    with pytest.raises(UserAlreadyExistsError):
        join_itinerary(admin_user.id, itinerary.viewer_code)

import pytest
from src.exceptions import (
    ItineraryDoesNotExistError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
    UserNotAuthorisedError,
)
from src.extensions import db
from src.models import InvitationStatus, UserRole
from src.services.users_service import (
    add_user_to_itinerary,
    get_user,
    remove_user,
    update_user_role,
)
from tests.factories import ItineraryUserFactory, UserFactory


def test_get_user_by_id(admin_user):
    result = get_user(id=admin_user.id)
    assert result is not None
    assert result.id == admin_user.id


def test_get_user_by_email(admin_user):
    result = get_user(email=admin_user.email)
    assert result is not None
    assert result.email == admin_user.email


def test_get_user_not_found_by_id(app):
    with pytest.raises(UserDoesNotExistError):
        get_user(id=99999)


def test_get_user_not_found_by_email(app):
    with pytest.raises(UserDoesNotExistError):
        get_user(email="nonexistent@example.com")


def test_add_user_to_itinerary_success(admin_user, itinerary):
    membership = add_user_to_itinerary(
        itinerary.id, admin_user.id, UserRole.VIEWER.value
    )
    assert membership is not None
    assert membership.user_id == admin_user.id
    assert membership.itinerary_id == itinerary.id
    assert membership.role == UserRole.VIEWER.value


def test_add_user_to_itinerary_already_member(
    admin_user, itinerary, admin_itinerary_user
):
    with pytest.raises(UserAlreadyExistsError):
        add_user_to_itinerary(itinerary.id, admin_user.id, UserRole.VIEWER.value)


def test_update_user_role_success(admin_user, itinerary, admin_itinerary_user):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=other_user,
        itinerary=itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )
    db.session.commit()
    updated = update_user_role(
        admin_user.id, itinerary.id, admin_user.id, UserRole.EDITOR.value
    )
    assert updated.role == UserRole.EDITOR.value
    assert updated.updated_by_id == admin_user.id


def test_update_user_role_other_user(admin_user, itinerary, admin_itinerary_user):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=other_user,
        itinerary=itinerary,
        role=UserRole.VIEWER.value,
        creator=admin_user,
    )

    updated = update_user_role(
        admin_user.id, itinerary.id, other_user.id, UserRole.EDITOR.value
    )
    assert updated.role == UserRole.EDITOR.value


def test_update_user_role_user_not_found(admin_user, itinerary):
    with pytest.raises(UserDoesNotExistError):
        update_user_role(admin_user.id, itinerary.id, 99999, UserRole.EDITOR.value)


def test_update_user_role_membership_not_found(admin_user, itinerary):
    other_user = UserFactory()
    with pytest.raises(ItineraryDoesNotExistError):
        update_user_role(
            admin_user.id, itinerary.id, other_user.id, UserRole.EDITOR.value
        )


def test_update_user_role_edit_other_admin(admin_user, itinerary, admin_itinerary_user):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=other_user,
        itinerary=itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )

    with pytest.raises(UserNotAuthorisedError) as exc_info:
        update_user_role(
            admin_user.id, itinerary.id, other_user.id, UserRole.VIEWER.value
        )
    assert "cannot edit the role of other admins" in str(exc_info.value).lower()


def test_update_user_role_demote_self_last_admin(
    admin_user, itinerary, admin_itinerary_user
):
    with pytest.raises(UserNotAuthorisedError) as exc_info:
        update_user_role(
            admin_user.id, itinerary.id, admin_user.id, UserRole.VIEWER.value
        )
    assert (
        "cannot demote yourself when there is only one admin"
        in str(exc_info.value).lower()
    )


def test_update_user_role_demote_self_multiple_admins(admin_user, itinerary):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=admin_user,
        itinerary=itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )
    ItineraryUserFactory(
        user=other_user,
        itinerary=itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )

    updated = update_user_role(
        admin_user.id, itinerary.id, admin_user.id, UserRole.VIEWER.value
    )
    assert updated.role == UserRole.VIEWER.value


def test_remove_user_success(
    admin_user, itinerary, admin_itinerary_user, viewer_user, viewer_itinerary_user
):
    removed_id = remove_user(admin_user.id, itinerary.id, viewer_user.id)
    assert removed_id == viewer_user.id


def test_remove_user_not_found(admin_user, itinerary):
    other_user = UserFactory()
    with pytest.raises(ItineraryDoesNotExistError):
        remove_user(admin_user.id, itinerary.id, other_user.id)


def test_remove_user_other_admin(admin_user, itinerary):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=other_user,
        itinerary=itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )

    with pytest.raises(UserNotAuthorisedError) as exc_info:
        remove_user(admin_user.id, itinerary.id, other_user.id)
    assert "cannot remove other admins" in str(exc_info.value).lower()


def test_remove_user_self_last_admin(admin_user, itinerary, admin_itinerary_user):
    with pytest.raises(UserNotAuthorisedError) as exc_info:
        remove_user(admin_user.id, itinerary.id, admin_user.id)
    assert (
        "cannot remove yourself when there is only one admin"
        in str(exc_info.value).lower()
    )


def test_remove_user_self_multiple_admins(admin_user, itinerary):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=admin_user,
        itinerary=itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )
    ItineraryUserFactory(
        user=other_user,
        itinerary=itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )

    removed_id = remove_user(admin_user.id, itinerary.id, admin_user.id)
    assert removed_id == admin_user.id


def test_remove_user_revokes_invite(
    admin_user, itinerary, invited_user, admin_itinerary_user, invite
):
    invite.status = InvitationStatus.ACCEPTED.value
    ItineraryUserFactory(
        user=invited_user,
        itinerary=itinerary,
        role=UserRole.VIEWER.value,
        creator=admin_user,
    )

    remove_user(admin_user.id, itinerary.id, invited_user.id)

    db.session.refresh(invite)
    assert invite.status == InvitationStatus.REVOKED.value

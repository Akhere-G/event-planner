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


def test_get_user_by_id(user):
    result = get_user(id=user.id)
    assert result is not None
    assert result.id == user.id


def test_get_user_by_email(user):
    result = get_user(email=user.email)
    assert result is not None
    assert result.email == user.email


def test_get_user_not_found_by_id(app):
    with pytest.raises(UserDoesNotExistError):
        get_user(id=99999)


def test_get_user_not_found_by_email(app):
    with pytest.raises(UserDoesNotExistError):
        get_user(email="nonexistent@example.com")


def test_add_user_to_itinerary_success(user, itinerary):
    membership = add_user_to_itinerary(itinerary.id, user.id, UserRole.VIEWER.value)
    assert membership is not None
    assert membership.user_id == user.id
    assert membership.itinerary_id == itinerary.id
    assert membership.role == UserRole.VIEWER.value


def test_add_user_to_itinerary_already_member(user, itinerary, itinerary_user):
    with pytest.raises(UserAlreadyExistsError):
        add_user_to_itinerary(itinerary.id, user.id, UserRole.VIEWER.value)


def test_update_user_role_success(user, itinerary, itinerary_user):
    itinerary_user.role = UserRole.ADMIN.value
    other_user = UserFactory()
    ItineraryUserFactory(
        user=other_user, itinerary=itinerary, role=UserRole.ADMIN.value, creator=user
    )
    db.session.commit()
    updated = update_user_role(user.id, itinerary.id, user.id, UserRole.EDITOR.value)
    assert updated.role == UserRole.EDITOR.value
    assert updated.updated_by_id == user.id


def test_update_user_role_other_user(user, itinerary, itinerary_user):
    itinerary_user.role = UserRole.ADMIN.value
    db.session.commit()
    other_user = UserFactory()
    ItineraryUserFactory(
        user=other_user, itinerary=itinerary, role=UserRole.VIEWER.value, creator=user
    )

    updated = update_user_role(
        user.id, itinerary.id, other_user.id, UserRole.EDITOR.value
    )
    assert updated.role == UserRole.EDITOR.value


def test_update_user_role_user_not_found(user, itinerary):
    with pytest.raises(UserDoesNotExistError):
        update_user_role(user.id, itinerary.id, 99999, UserRole.EDITOR.value)


def test_update_user_role_membership_not_found(user, itinerary):
    other_user = UserFactory()
    with pytest.raises(ItineraryDoesNotExistError):
        update_user_role(user.id, itinerary.id, other_user.id, UserRole.EDITOR.value)


def test_update_user_role_edit_other_admin(user, itinerary, itinerary_user):
    itinerary_user.role = UserRole.ADMIN.value
    db.session.commit()
    other_user = UserFactory()
    ItineraryUserFactory(
        user=other_user, itinerary=itinerary, role=UserRole.ADMIN.value, creator=user
    )

    with pytest.raises(UserNotAuthorisedError) as exc_info:
        update_user_role(user.id, itinerary.id, other_user.id, UserRole.VIEWER.value)
    assert "cannot edit the role of other admins" in str(exc_info.value).lower()


def test_update_user_role_demote_self_last_admin(user, itinerary, itinerary_user):
    itinerary_user.role = UserRole.ADMIN.value

    db.session.commit()

    with pytest.raises(UserNotAuthorisedError) as exc_info:
        update_user_role(user.id, itinerary.id, user.id, UserRole.VIEWER.value)
    assert (
        "cannot demote yourself when there is only one admin"
        in str(exc_info.value).lower()
    )


def test_update_user_role_demote_self_multiple_admins(user, itinerary):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=user, itinerary=itinerary, role=UserRole.ADMIN.value, creator=user
    )
    ItineraryUserFactory(
        user=other_user, itinerary=itinerary, role=UserRole.ADMIN.value, creator=user
    )

    updated = update_user_role(user.id, itinerary.id, user.id, UserRole.VIEWER.value)
    assert updated.role == UserRole.VIEWER.value


# fails because  "You cannot remove yourself when there is only one admin. Appoint another first."
def test_remove_user_success(user, itinerary, itinerary_user):
    removed_id = remove_user(user.id, itinerary.id, user.id)
    assert removed_id == user.id


def test_remove_user_not_found(user, itinerary):
    other_user = UserFactory()
    with pytest.raises(ItineraryDoesNotExistError):
        remove_user(user.id, itinerary.id, other_user.id)


def test_remove_user_other_admin(user, itinerary):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=other_user, itinerary=itinerary, role=UserRole.ADMIN.value, creator=user
    )

    with pytest.raises(UserNotAuthorisedError) as exc_info:
        remove_user(user.id, itinerary.id, other_user.id)
    assert "cannot remove other admins" in str(exc_info.value).lower()


def test_remove_user_self_last_admin(user, itinerary, itinerary_user):
    itinerary_user.role = UserRole.ADMIN.value

    db.session.commit()

    with pytest.raises(UserNotAuthorisedError) as exc_info:
        remove_user(user.id, itinerary.id, user.id)
    assert (
        "cannot remove yourself when there is only one admin"
        in str(exc_info.value).lower()
    )


def test_remove_user_self_multiple_admins(user, itinerary):
    other_user = UserFactory()
    ItineraryUserFactory(
        user=user, itinerary=itinerary, role=UserRole.ADMIN.value, creator=user
    )
    ItineraryUserFactory(
        user=other_user, itinerary=itinerary, role=UserRole.ADMIN.value, creator=user
    )

    removed_id = remove_user(user.id, itinerary.id, user.id)
    assert removed_id == user.id


def test_remove_user_revokes_invite(
    user, itinerary, uninvited_user, itinerary_user, invite
):
    itinerary_user.role = UserRole.ADMIN.value

    db.session.commit()

    invite.status = InvitationStatus.ACCEPTED.value
    ItineraryUserFactory(
        user=uninvited_user,
        itinerary=itinerary,
        role=UserRole.VIEWER.value,
        creator=user,
    )

    remove_user(user.id, itinerary.id, uninvited_user.id)

    db.session.refresh(invite)
    assert invite.status == InvitationStatus.REVOKED.value

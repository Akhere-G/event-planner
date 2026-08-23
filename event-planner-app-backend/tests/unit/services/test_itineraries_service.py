from datetime import date

import pytest
from src.exceptions import ItineraryDoesNotExistError, UserNotAuthorisedError
from src.models import UserRole
from src.services.itineraries_service import (
    create_itinerary,
    delete_itinerary,
    get_itineraries,
    get_itinerary,
    get_itinerary_count,
    get_itinerary_membership,
    get_itinerary_memberships,
    get_membership_by_email,
    is_authorised,
    is_user_in_itinerary,
    update_itinerary,
)
from tests.factories import ItineraryUserFactory


def test_get_membership_by_email_success(user, itinerary_user, itinerary):
    membership = get_membership_by_email(user.email, itinerary.id)
    assert membership is not None
    assert membership.user_id == user.id
    assert membership.itinerary_id == itinerary.id


def test_get_membership_by_email_not_member(invited_user, itinerary):
    assert get_membership_by_email(invited_user.email, itinerary.id) is None


def test_get_membership_by_email_user_not_found(itinerary):
    assert get_membership_by_email("nonexistent@example.com", itinerary.id) is None


def test_is_user_in_itinerary_success(user, itinerary_user, itinerary):
    membership = is_user_in_itinerary(user.id, itinerary.id)
    assert membership.user_id == user.id
    assert membership.itinerary_id == itinerary.id


def test_is_user_in_itinerary_not_found(invited_user, itinerary):
    with pytest.raises(ItineraryDoesNotExistError):
        is_user_in_itinerary(invited_user.id, itinerary.id)


def test_get_itinerary_membership_success(user, itinerary_user, itinerary):
    membership = get_itinerary_membership(user.id, itinerary.id)
    assert membership.user_id == user.id
    assert membership.itinerary_id == itinerary.id
    assert membership.user == user
    assert membership.itinerary == itinerary


def test_get_itinerary_membership_not_found(invited_user, itinerary):
    with pytest.raises(ItineraryDoesNotExistError):
        get_itinerary_membership(invited_user.id, itinerary.id)


def test_get_itinerary_count(user, itinerary_user):
    assert get_itinerary_count(user.id) == 1


def test_get_itinerary_count_zero(invited_user):
    assert get_itinerary_count(invited_user.id) == 0


def test_get_itinerary_memberships(itinerary, itinerary_user):
    memberships = get_itinerary_memberships(itinerary.id)
    assert len(memberships) == 1
    assert memberships[0].user_id == itinerary_user.user_id
    assert memberships[0].itinerary_id == itinerary_user.itinerary_id


def test_get_itinerary_memberships_pagination(itinerary, itinerary_user):
    memberships = get_itinerary_memberships(itinerary.id, limit=1, offset=0)
    assert len(memberships) == 1


def test_get_itinerary_success(itinerary):
    result = get_itinerary(itinerary.id)
    assert result.id == itinerary.id


def test_get_itinerary_not_found(app):
    with pytest.raises(ItineraryDoesNotExistError):
        get_itinerary(99999)


def test_get_itineraries(user, itinerary_user, itinerary):
    result = get_itineraries(user.id, 10, 0)
    assert result == [{"itinerary": itinerary, "role": "viewer"}]


def test_create_itinerary_success(user):
    data = {
        "name": "New Trip",
        "destination": "Tokyo",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "description": "Tokyo trip",
        "start_date": date(2026, 9, 1),
        "end_date": date(2026, 9, 5),
        "created_by_id": user.id,
        "updated_by_id": user.id,
    }
    new_itinerary = create_itinerary(user.id, data)
    assert new_itinerary.id is not None
    assert new_itinerary.name == "New Trip"
    assert new_itinerary.created_by_id == user.id
    assert new_itinerary.updated_by_id == user.id
    assert new_itinerary.viewer_code is not None
    assert new_itinerary.editor_code is not None
    assert new_itinerary.admin_code is not None

    membership = is_user_in_itinerary(user.id, new_itinerary.id)
    assert membership.role == UserRole.ADMIN.value
    assert membership.created_by_id == user.id
    assert membership.updated_by_id == user.id


def test_is_authorised_success(user, itinerary):
    ItineraryUserFactory(
        user=user, itinerary=itinerary, role=UserRole.ADMIN.value, creator=user
    )
    is_authorised(user.id, itinerary.id, [UserRole.ADMIN])


def test_is_authorised_unauthorised_role(user, itinerary_user, itinerary):
    with pytest.raises(UserNotAuthorisedError):
        is_authorised(user.id, itinerary.id, [UserRole.ADMIN])


def test_is_authorised_not_member(invited_user, itinerary):
    with pytest.raises(ItineraryDoesNotExistError):
        is_authorised(invited_user.id, itinerary.id)


def test_update_itinerary_success(itinerary):
    updated = update_itinerary(
        itinerary.id, {"name": "Updated Name", "destination": "Kyoto"}
    )
    assert updated.name == "Updated Name"
    assert updated.destination == "Kyoto"


def test_update_itinerary_not_found(app):
    with pytest.raises(ItineraryDoesNotExistError):
        update_itinerary(99999, {"name": "Test"})


def test_delete_itinerary_success(itinerary):
    delete_itinerary(itinerary.id)
    with pytest.raises(ItineraryDoesNotExistError):
        get_itinerary(itinerary.id)


def test_delete_itinerary_not_found(app):
    with pytest.raises(ItineraryDoesNotExistError):
        delete_itinerary(99999)

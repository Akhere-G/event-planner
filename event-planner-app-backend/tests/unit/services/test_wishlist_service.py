from datetime import datetime

import pytest
from sqlalchemy import select
from src.exceptions import BadRequestError
from src.extensions import db
from src.models import WishlistItemVote
from src.services.wishlist_service import (
    create_wishlist,
    create_wishlist_item,
    delete_wishlist,
    delete_wishlist_item,
    get_wishlists,
    itinerary_contains_wishlist_item,
    promote_wishlist_item,
    update_wishlist,
    update_wishlist_item,
    vote_for_wishlist_item,
)
from tests.factories import WishlistFactory


def test_get_wishlists_success(wishlist):
    wishlists = get_wishlists(wishlist.itinerary_id)
    assert len(wishlists) == 1
    assert wishlists[0].id == wishlist.id
    assert wishlists[0].name == wishlist.name


def test_get_wishlists_empty(itinerary):
    wishlists = get_wishlists(itinerary.id)
    assert wishlists == []


def test_create_wishlist_success(admin_user, itinerary):
    wishlist = create_wishlist(admin_user.id, itinerary.id, "New Wishlist")
    assert wishlist.id is not None
    assert wishlist.name == "New Wishlist"
    assert wishlist.itinerary_id == itinerary.id
    assert wishlist.created_by_id == admin_user.id


def test_create_wishlist_duplicate_name(admin_user, wishlist):
    with pytest.raises(BadRequestError) as exc_info:
        create_wishlist(admin_user.id, wishlist.itinerary_id, wishlist.name)
    assert "already exists" in str(exc_info.value)


def test_update_wishlist_success(admin_user, wishlist):
    updated = update_wishlist(
        wishlist.itinerary_id, wishlist.id, admin_user.id, "Updated Name"
    )
    assert updated.name == "Updated Name"
    assert updated.updated_by_id == admin_user.id


def test_update_wishlist_duplicate_name(admin_user, itinerary):
    wishlist1 = WishlistFactory(
        itinerary=itinerary, creator=admin_user, name="Wishlist 1"
    )
    wishlist2 = WishlistFactory(
        itinerary=itinerary, creator=admin_user, name="Wishlist 2"
    )

    with pytest.raises(BadRequestError) as exc_info:
        update_wishlist(itinerary.id, wishlist1.id, admin_user.id, "Wishlist 2")
    assert "already exists" in str(exc_info.value)


def test_update_wishlist_not_found(admin_user, itinerary):
    with pytest.raises(BadRequestError) as exc_info:
        update_wishlist(itinerary.id, 99999, admin_user.id, "Updated Name")
    assert "not found" in str(exc_info.value)


def test_delete_wishlist_success(wishlist):
    wishlist_id = wishlist.id
    itinerary_id = wishlist.itinerary_id

    result = delete_wishlist(itinerary_id, wishlist_id)
    assert result == wishlist_id

    wishlists = get_wishlists(itinerary_id)
    assert len(wishlists) == 0


def test_delete_wishlist_not_found(itinerary):
    with pytest.raises(BadRequestError) as exc_info:
        delete_wishlist(itinerary.id, 99999)
    assert "not found" in str(exc_info.value)


def test_create_wishlist_item_success(admin_user, wishlist):
    item_data = {
        "name": "New Item",
        "address": "123 New St",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "description": "New item description",
        "place_id": "place123",
    }

    item = create_wishlist_item(
        wishlist.itinerary_id, wishlist.id, item_data, admin_user.id
    )
    assert item.id is not None
    assert item.name == "New Item"
    assert item.wishlist_id == wishlist.id
    assert item.created_by_id == admin_user.id


def test_create_wishlist_item_wishlist_not_found(admin_user, itinerary):
    item_data = {"name": "New Item"}

    with pytest.raises(BadRequestError) as exc_info:
        create_wishlist_item(itinerary.id, 99999, item_data, admin_user.id)
    assert "does not exist" in str(exc_info.value)


def test_itinerary_contains_wishlist_item_true(wishlist_item):
    result = itinerary_contains_wishlist_item(
        wishlist_item.wishlist.itinerary_id, wishlist_item.id
    )
    assert result is True


def test_itinerary_contains_wishlist_item_false(itinerary):
    result = itinerary_contains_wishlist_item(itinerary.id, 99999)
    assert result is False


def test_delete_wishlist_item_success(wishlist_item):
    item_id = wishlist_item.id

    result = delete_wishlist_item(item_id)
    assert result == item_id

    result = itinerary_contains_wishlist_item(
        wishlist_item.wishlist.itinerary_id, item_id
    )
    assert result is False


def test_delete_wishlist_item_not_found(app):
    with pytest.raises(BadRequestError) as exc_info:
        delete_wishlist_item(99999)
    assert "not found" in str(exc_info.value)


def test_update_wishlist_item_success(admin_user, wishlist_item):
    item_data = {
        "name": "Updated Item",
        "address": "Updated Address",
        "description": "Updated description",
    }

    updated = update_wishlist_item(
        wishlist_item.wishlist.itinerary_id,
        wishlist_item.wishlist_id,
        wishlist_item.id,
        item_data,
        admin_user.id,
    )
    assert updated.name == "Updated Item"
    assert updated.address == "Updated Address"
    assert updated.description == "Updated description"
    assert updated.updated_by_id == admin_user.id


def test_update_wishlist_item_not_found(admin_user, wishlist):
    item_data = {"name": "Updated"}

    with pytest.raises(BadRequestError) as exc_info:
        update_wishlist_item(
            wishlist.itinerary_id, wishlist.id, 99999, item_data, admin_user.id
        )
    assert "not found" in str(exc_info.value)


def test_promote_wishlist_item_success(admin_user, wishlist_item):
    start_at = datetime(2026, 8, 20, 10, 0)
    end_at = datetime(2026, 8, 20, 12, 0)

    event = promote_wishlist_item(
        wishlist_item.wishlist.itinerary_id,
        wishlist_item.id,
        start_at,
        end_at,
        admin_user.id,
    )

    assert event.id is not None
    assert event.name == wishlist_item.name
    assert event.category == wishlist_item.wishlist.name

    db.session.refresh(wishlist_item)
    assert wishlist_item.is_promoted is True


def test_promote_wishlist_item_already_promoted(admin_user, wishlist_item):
    wishlist_item.is_promoted = True

    db.session.flush()

    start_at = datetime(2026, 8, 20, 10, 0)
    end_at = datetime(2026, 8, 20, 12, 0)

    with pytest.raises(BadRequestError) as exc_info:
        promote_wishlist_item(
            wishlist_item.wishlist.itinerary_id,
            wishlist_item.id,
            start_at,
            end_at,
            admin_user.id,
        )
    assert "already been promoted" in str(exc_info.value)


def test_promote_wishlist_item_not_found(admin_user, wishlist):
    start_at = datetime(2026, 8, 20, 10, 0)
    end_at = datetime(2026, 8, 20, 12, 0)

    with pytest.raises(BadRequestError) as exc_info:
        promote_wishlist_item(
            wishlist.itinerary_id, 99999, start_at, end_at, admin_user.id
        )
    assert "not found" in str(exc_info.value)


def test_vote_for_wishlist_item_thumbs_up(admin_user, wishlist_item):
    vote_for_wishlist_item(admin_user.id, wishlist_item.id, 1)

    stmt = select(WishlistItemVote).where(
        WishlistItemVote.wishlist_item_id == wishlist_item.id,
        WishlistItemVote.user_id == admin_user.id,
    )
    vote = db.session.execute(stmt).scalar_one_or_none()

    assert vote is not None
    assert vote.is_thumbs_up is True


def test_vote_for_wishlist_item_thumbs_down(admin_user, wishlist_item):
    vote_for_wishlist_item(admin_user.id, wishlist_item.id, -1)

    stmt = select(WishlistItemVote).where(
        WishlistItemVote.wishlist_item_id == wishlist_item.id,
        WishlistItemVote.user_id == admin_user.id,
    )
    vote = db.session.execute(stmt).scalar_one_or_none()

    assert vote is not None
    assert vote.is_thumbs_up is False


def test_vote_for_wishlist_item_invalid_vote(admin_user, wishlist_item):
    with pytest.raises(BadRequestError) as exc_info:
        vote_for_wishlist_item(admin_user.id, wishlist_item.id, 2)
    assert "must be either 1 or -1" in str(exc_info.value)


def test_vote_for_wishlist_item_toggle_vote(admin_user, wishlist_item):
    vote_for_wishlist_item(admin_user.id, wishlist_item.id, 1)

    vote_for_wishlist_item(admin_user.id, wishlist_item.id, -1)

    stmt = select(WishlistItemVote).where(
        WishlistItemVote.wishlist_item_id == wishlist_item.id,
        WishlistItemVote.user_id == admin_user.id,
    )
    vote = db.session.execute(stmt).scalar_one_or_none()

    assert vote is not None
    assert vote.is_thumbs_up is False


def test_vote_for_wishlist_item_remove_vote(admin_user, wishlist_item):
    vote_for_wishlist_item(admin_user.id, wishlist_item.id, 1)

    vote_for_wishlist_item(admin_user.id, wishlist_item.id, 1)

    stmt = select(WishlistItemVote).where(
        WishlistItemVote.wishlist_item_id == wishlist_item.id,
        WishlistItemVote.user_id == admin_user.id,
    )
    vote = db.session.execute(stmt).scalar_one_or_none()

    assert vote is None

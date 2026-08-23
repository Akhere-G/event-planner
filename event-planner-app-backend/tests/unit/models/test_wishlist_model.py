import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from src.extensions import db
from src.models import Wishlist, WishlistItem, WishlistItemVote


def test_wishlist_creation(wishlist, itinerary):
    assert isinstance(wishlist, Wishlist)
    assert wishlist.itinerary_id == itinerary.id
    assert wishlist.name.startswith("Wishlist")


def test_wishlist_relationship(wishlist, itinerary):
    assert wishlist.items is not None
    assert wishlist.creator is not None


def test_wishlist_has_audit_fields(wishlist, admin_user):
    assert wishlist.created_at is not None
    assert wishlist.updated_at is not None
    assert wishlist.created_by_id == admin_user.id
    assert wishlist.updated_by_id == admin_user.id


def test_wishlist_name_must_be_unique_per_itinerary(
    wishlist,
    itinerary,
):
    duplicate = Wishlist(
        itinerary_id=itinerary.id,
        name=wishlist.name,
    )

    db.session.add(duplicate)

    with pytest.raises(IntegrityError):
        db.session.flush()


def test_same_wishlist_name_allowed_in_different_itineraries(
    wishlist,
    admin_user,
):
    from src.models import Itinerary

    other_itinerary = Itinerary(
        name="Other Trip",
        destination="Rome",
        latitude=41.9028,
        longitude=12.4964,
        description="Another trip",
        start_date=wishlist.itinerary.start_date,
        end_date=wishlist.itinerary.end_date,
        created_by_id=admin_user.id,
        updated_by_id=admin_user.id,
    )

    db.session.add(other_itinerary)
    db.session.flush()

    other_wishlist = Wishlist(
        itinerary_id=other_itinerary.id,
        name=wishlist.name,
        created_by_id=admin_user.id,
        updated_by_id=admin_user.id,
    )

    db.session.add(other_wishlist)
    db.session.flush()

    assert other_wishlist.id is not None


def test_wishlist_cascade_when_itinerary_deleted(
    wishlist,
    itinerary,
):
    wishlist_id = wishlist.id

    db.session.delete(itinerary)
    db.session.flush()

    result = db.session.execute(
        select(Wishlist).where(Wishlist.id == wishlist_id)
    ).scalar_one_or_none()

    assert result is None


def test_wishlist_item_creation(wishlist_item, wishlist):
    assert isinstance(wishlist_item, WishlistItem)
    assert wishlist_item.wishlist_id == wishlist.id
    assert wishlist_item.name.startswith("Wishlist Item 0")
    assert wishlist_item.address == "123 Food St"
    assert wishlist_item.latitude == 40.7128
    assert wishlist_item.longitude == -74.0060
    assert wishlist_item.description == "Sample item"
    assert wishlist_item.place_id == "place0"


def test_wishlist_item_default_is_not_promoted(wishlist_item):
    assert wishlist_item.is_promoted is False


def test_wishlist_item_relationship(wishlist_item, wishlist):
    assert wishlist_item.wishlist == wishlist


def test_wishlist_item_has_audit_fields(wishlist_item, admin_user):
    assert wishlist_item.created_at is not None
    assert wishlist_item.updated_at is not None
    assert wishlist_item.created_by_id == admin_user.id
    assert wishlist_item.updated_by_id == admin_user.id


def test_wishlist_cascades_to_items_when_deleted(
    wishlist,
    wishlist_item,
):
    item_id = wishlist_item.id

    db.session.delete(wishlist)
    db.session.flush()

    result = db.session.execute(
        select(WishlistItem).where(WishlistItem.id == item_id)
    ).scalar_one_or_none()

    assert result is None


def test_wishlist_item_vote_creation(
    wishlist_item_vote,
    wishlist_item,
    admin_user,
):
    assert isinstance(wishlist_item_vote, WishlistItemVote)
    assert wishlist_item_vote.wishlist_item_id == wishlist_item.id
    assert wishlist_item_vote.user_id == admin_user.id
    assert wishlist_item_vote.is_thumbs_up is True


def test_wishlist_item_vote_relationships(
    wishlist_item_vote,
    wishlist_item,
    admin_user,
):
    assert wishlist_item_vote.wishlist_item == wishlist_item
    assert wishlist_item_vote.user == admin_user


def test_wishlist_item_vote_has_audit_fields(
    wishlist_item_vote,
    admin_user,
):
    assert wishlist_item_vote.created_at is not None
    assert wishlist_item_vote.updated_at is not None
    assert wishlist_item_vote.created_by_id == admin_user.id
    assert wishlist_item_vote.updated_by_id == admin_user.id


def test_duplicate_vote_for_same_user_and_item_is_rejected(
    wishlist_item_vote,
    wishlist_item,
    admin_user,
):
    duplicate = WishlistItemVote(
        wishlist_item_id=wishlist_item.id,
        user_id=admin_user.id,
        is_thumbs_up=False,
        created_by_id=admin_user.id,
        updated_by_id=admin_user.id,
    )

    db.session.add(duplicate)

    with pytest.raises(IntegrityError):
        db.session.flush()


def test_vote_cascade_when_wishlist_item_deleted(
    wishlist_item,
    wishlist_item_vote,
):
    item_id = wishlist_item_vote.wishlist_item_id
    user_id = wishlist_item_vote.user_id

    db.session.delete(wishlist_item)
    db.session.flush()

    result = db.session.execute(
        select(WishlistItemVote)
        .where(WishlistItemVote.wishlist_item_id == item_id)
        .where(WishlistItemVote.user_id == user_id)
    ).scalar_one_or_none()

    assert result is None


def test_vote_cascade_when_user_deleted(
    admin_user,
    wishlist_item_vote,
):
    item_id = wishlist_item_vote.wishlist_item_id
    user_id = wishlist_item_vote.user_id

    db.session.delete(admin_user)
    db.session.flush()

    result = db.session.execute(
        select(WishlistItemVote)
        .where(WishlistItemVote.wishlist_item_id == item_id)
        .where(WishlistItemVote.user_id == user_id)
    ).scalar_one_or_none()

    assert result is None

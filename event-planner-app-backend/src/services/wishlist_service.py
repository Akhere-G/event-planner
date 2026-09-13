from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..exceptions import BadRequestError
from ..extensions import db
from ..models import Wishlist, WishlistItem, WishlistItemVote
from ..utils.location_utils import get_place_details
from .events_service import create_event


def get_wishlists(itinerary_id: int):
    stmt = (
        select(Wishlist)
        .where(Wishlist.itinerary_id == itinerary_id)
        .options(
            selectinload(Wishlist.items)
            .selectinload(WishlistItem.votes)
            .selectinload(WishlistItemVote.user)
        )
    )

    return db.session.execute(stmt).scalars().all()


def create_wishlist(user_id: int | None, itinerary_id: int, name: str):
    try:
        stmt = select(Wishlist).where(
            Wishlist.itinerary_id == itinerary_id,
            Wishlist.name == name,
        )

        existing = db.session.execute(stmt).scalar_one_or_none()

        if existing:
            raise BadRequestError(f"Wishlist '{name}' already exists.")

        wishlist = Wishlist(
            itinerary_id=itinerary_id,
            name=name,
            created_by_id=user_id,
            updated_by_id=user_id,
        )

        db.session.add(wishlist)
        db.session.commit()

        return wishlist

    except Exception:
        db.session.rollback()
        raise


def update_wishlist(
    itinerary_id: int,
    wishlist_id: int,
    user_id: int | None,
    name: str,
):
    try:
        stmt = select(Wishlist).where(
            Wishlist.itinerary_id == itinerary_id,
            Wishlist.id == wishlist_id,
        )

        wishlist = db.session.execute(stmt).scalar_one_or_none()

        if not wishlist:
            raise BadRequestError("Wishlist not found.")

        exisiting_wishlist = db.session.execute(
            select(Wishlist).where(
                Wishlist.itinerary_id == itinerary_id, Wishlist.name == name
            )
        ).scalar_one_or_none()

        if exisiting_wishlist:
            raise BadRequestError(f"Wishlist with the name '{name}' already exists.")

        wishlist.name = name
        wishlist.updated_by_id = user_id

        db.session.commit()

        return wishlist

    except Exception:
        db.session.rollback()
        raise


def delete_wishlist(itinerary_id: int, wishlist_id: int):
    try:
        stmt = select(Wishlist).where(
            Wishlist.itinerary_id == itinerary_id,
            Wishlist.id == wishlist_id,
        )

        wishlist = db.session.execute(stmt).scalar_one_or_none()

        if not wishlist:
            raise BadRequestError("Wishlist not found.")

        db.session.delete(wishlist)
        db.session.commit()

        return wishlist_id

    except Exception:
        db.session.rollback()
        raise


def create_wishlist_item(
    itinerary_id: int,
    wishlist_id: int,
    item_data: dict,
    user_id: int | None,
):
    try:
        stmt = select(Wishlist).where(
            Wishlist.id == wishlist_id,
            Wishlist.itinerary_id == itinerary_id,
        )

        wishlist = db.session.execute(stmt).scalar_one_or_none()

        if not wishlist:
            raise BadRequestError("Wishlist does not exist.")

        item = WishlistItem(
            wishlist_id=wishlist_id,
            name=item_data.get("name"),
            address=item_data.get("address"),
            latitude=item_data.get("latitude"),
            longitude=item_data.get("longitude"),
            description=item_data.get("description"),
            place_id=item_data.get("place_id"),
            created_by_id=user_id,
            updated_by_id=user_id,
        )

        db.session.add(item)
        db.session.commit()

        return item

    except Exception:
        db.session.rollback()
        raise


def itinerary_contains_wishlist_item(
    itinerary_id: int,
    wishlist_item_id: int,
):
    stmt = (
        select(Wishlist.id)
        .join(
            WishlistItem,
            Wishlist.id == WishlistItem.wishlist_id,
        )
        .where(
            Wishlist.itinerary_id == itinerary_id,
            WishlistItem.id == wishlist_item_id,
        )
    )

    return bool(db.session.execute(stmt).scalar_one_or_none())


def delete_wishlist_item(item_id: int):
    try:
        stmt = select(WishlistItem).where(WishlistItem.id == item_id)

        item = db.session.execute(stmt).scalar_one_or_none()

        if not item:
            raise BadRequestError("Wishlist item not found.")

        db.session.delete(item)
        db.session.commit()

        return item_id

    except Exception:
        db.session.rollback()
        raise


def update_wishlist_item(
    itinerary_id: int,
    wishlist_id: int,
    item_id: int,
    item_data: dict,
    user_id: int | None,
):
    try:
        stmt = (
            select(WishlistItem)
            .join(
                Wishlist,
                Wishlist.id == WishlistItem.wishlist_id,
            )
            .where(
                Wishlist.itinerary_id == itinerary_id,
                WishlistItem.wishlist_id == wishlist_id,
                WishlistItem.id == item_id,
            )
        )

        item = db.session.execute(stmt).scalar_one_or_none()

        if not item:
            raise BadRequestError("Wishlist item not found.")

        updatable_fields = {
            "name",
            "address",
            "description",
            "latitude",
            "longitude",
            "place_id",
        }

        for field in updatable_fields:
            if field in item_data:
                setattr(item, field, item_data[field])

        item.updated_by_id = user_id

        db.session.commit()

        return item

    except Exception:
        db.session.rollback()
        raise


def promote_wishlist_item(
    itinerary_id: int,
    item_id: int,
    start_at: datetime,
    end_at: datetime,
    user_id: int | None,
):
    try:
        stmt = (
            select(WishlistItem)
            .join(
                Wishlist,
                Wishlist.id == WishlistItem.wishlist_id,
            )
            .where(
                Wishlist.itinerary_id == itinerary_id,
                WishlistItem.id == item_id,
            )
            .options(selectinload(WishlistItem.wishlist))
        )

        item = db.session.execute(stmt).scalar_one_or_none()

        if not item:
            raise BadRequestError("Wishlist item not found.")

        if item.is_promoted:
            raise BadRequestError("This item has already been promoted.")

        if item.latitude is None or item.longitude is None:
            place_details = get_place_details(
                name=item.name,
                address=item.address,
            )

            item.latitude = place_details["latitude"]
            item.longitude = place_details["longitude"]

            if item.address is None:
                item.address = place_details["formatted_address"]

        event_data = {
            "name": item.name,
            "address": item.address,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "description": item.description,
            "category": item.wishlist.name,
            "start_at": start_at,
            "end_at": end_at,
            "created_by_id": user_id,
            "updated_by_id": user_id,
        }

        event = create_event(
            itinerary_id,
            event_data,
        )

        item.is_promoted = True

        db.session.commit()

        return event

    except Exception:
        db.session.rollback()
        raise


def vote_for_wishlist_item(
    user_id: int,
    item_id: int,
    vote: int,
):
    try:
        if vote not in (-1, 1):
            raise BadRequestError("Vote must be either 1 or -1.")

        stmt = select(WishlistItemVote).where(
            WishlistItemVote.wishlist_item_id == item_id,
            WishlistItemVote.user_id == user_id,
        )

        wishlist_item_vote = db.session.execute(stmt).scalar_one_or_none()

        if wishlist_item_vote:
            existing_vote = 1 if wishlist_item_vote.is_thumbs_up else -1

            if existing_vote == vote:
                db.session.delete(wishlist_item_vote)
                db.session.commit()
                return

            wishlist_item_vote.is_thumbs_up = vote == 1
            wishlist_item_vote.updated_by_id = user_id

        else:
            wishlist_item_vote = WishlistItemVote(
                wishlist_item_id=item_id,
                user_id=user_id,
                is_thumbs_up=vote == 1,
                created_by_id=user_id,
                updated_by_id=user_id,
            )

            db.session.add(wishlist_item_vote)

        db.session.commit()

    except Exception:
        db.session.rollback()
        raise

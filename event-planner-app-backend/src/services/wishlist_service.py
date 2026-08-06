from ..extensions import db
from ..models import Wishlist, WishlistItem, WishlistItemVote
from .events_service import create_event
from ..exceptions import BadRequestError
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
import googlemaps
import os


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


def create_wishlist(user_id: int, itinerary_id: int, name: str):
    stmt = (
        select(Wishlist)
        .where(Wishlist.itinerary_id == itinerary_id)
        .where(Wishlist.name == name)
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


def update_wishlist(itinerary_id: int, wishlist_id: int, user_id: int, name: str):
    stmt = select(Wishlist).where(
        Wishlist.itinerary_id == itinerary_id,
        Wishlist.id == wishlist_id,
    )

    wishlist = db.session.execute(stmt).scalar_one_or_none()

    if not wishlist:
        raise BadRequestError("Wishlist not found.")

    wishlist.name = name
    wishlist.updated_by_id = user_id

    db.session.commit()

    return wishlist


def delete_wishlist(itinerary_id: int, wishlist_id: int):
    stmt = (
        select(Wishlist)
        .where(
            Wishlist.itinerary_id == itinerary_id,
            Wishlist.id == wishlist_id,
        )
        .options(selectinload(Wishlist.items))
    )

    wishlist = db.session.execute(stmt).scalar_one_or_none()
    if not wishlist:
        raise BadRequestError("Wishlist not found.")

    db.session.delete(wishlist)
    db.session.commit()
    return wishlist_id


def create_wishlist_item(
    itinerary_id: int, wishlist_id: int, item_data: dict, user_id: int
):
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


def itinerary_contains_wishlist_item(itinerary_id: int, wishlist_item_id: int):
    stmt = (
        select(Wishlist.id)
        .join(WishlistItem, Wishlist.id == WishlistItem.wishlist_id)
        .where(
            Wishlist.itinerary_id == itinerary_id,
            WishlistItem.id == wishlist_item_id,
        )
    )
    return bool(db.session.execute(stmt).scalar_one_or_none())


def delete_wishlist_item(item_id: int):
    stmt = select(WishlistItem).where(WishlistItem.id == item_id)
    item = db.session.execute(stmt).scalar_one_or_none()
    if not item:
        raise BadRequestError("Wishlist item not found.")

    db.session.delete(item)
    db.session.commit()
    return item_id


def update_wishlist_item(
    itinerary_id: int, wishlist_id: int, item_id: int, item_data: dict, user_id: int
):
    stmt = (
        select(WishlistItem)
        .join(Wishlist, Wishlist.id == WishlistItem.wishlist_id)
        .where(
            Wishlist.itinerary_id == itinerary_id,
            WishlistItem.wishlist_id == wishlist_id,
            WishlistItem.id == item_id,
        )
    )
    item = db.session.execute(stmt).scalar_one_or_none()
    if not item:
        raise BadRequestError("Wishlist item not found.")

    updatable_fields = [
        "name",
        "address",
        "description",
        "latitude",
        "longitude",
        "place_id",
    ]
    for field in updatable_fields:
        if field in item_data:
            setattr(item, field, item_data[field])

    item.updated_by_id = user_id
    db.session.commit()
    return item


def promote_wishlist_item(
    itinerary_id: int, item_id: int, start_at: datetime, end_at: datetime, user_id: int
):
    stmt = (
        select(WishlistItem)
        .where(WishlistItem.id == item_id)
        .options(selectinload(WishlistItem.wishlist))
    )
    item = db.session.execute(stmt).scalar_one_or_none()
    if not item:
        raise BadRequestError("Wishlist item not found.")

    if item.is_promoted:
        raise BadRequestError("This item has already been promoted.")

    item.is_promoted = True

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

    if event_data["longitude"] is None or event_data["latitude"] is None:
        gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

        result = gmaps.geocode(f"{item.name}, {item.address or ''}")  # type: ignore
        if result:
            location = result[0]["geometry"]["location"]
            event_data["latitude"] = location["lat"]
            event_data["longitude"] = location["lng"]
            if event_data["address"] is None:
                event_data["address"] = result[0]["formatted_address"]

    event = create_event(itinerary_id, event_data)
    return event


def vote_for_wishlist_item(user_id, item_id, vote):
    stmt = select(WishlistItemVote).where(
        WishlistItemVote.wishlist_item_id == item_id,
        WishlistItemVote.user_id == user_id,
    )

    wishlist_item_vote = db.session.execute(stmt).scalar_one_or_none()

    if wishlist_item_vote and (
        wishlist_item_vote.isThumbsUp
        and vote == 1
        or (not wishlist_item_vote.isThumbsUp and vote == -1)
    ):
        db.session.delete(wishlist_item_vote)
        db.session.commit()
        return

    if not wishlist_item_vote:
        wishlist_item_vote = WishlistItemVote(
            wishlist_item_id=item_id,
            user_id=user_id,
            isThumbsUp=vote == 1,
            created_by_id=user_id,
            updated_by_id=user_id,
        )
        db.session.add(wishlist_item_vote)
    else:
        wishlist_item_vote.isThumbsUp = vote == 1
        wishlist_item_vote.updated_by_id = user_id

    db.session.commit()

from ..extensions import db
from ..models import WishlistCategory, WishlistItem
from .events_service import create_event
from ..exceptions import BadRequestError
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime


def get_wishlists(itinerary_id: int):
    stmt = (
        select(WishlistCategory)
        .where(WishlistCategory.itinerary_id == itinerary_id)
        .options(selectinload(WishlistCategory.items))
    )
    return db.session.execute(stmt).scalars().all()


def create_category(itinerary_id: int, name: str):
    stmt = (
        select(WishlistCategory)
        .where(WishlistCategory.itinerary_id == itinerary_id)
        .where(WishlistCategory.name == name)
    )
    existing = db.session.execute(stmt).scalar_one_or_none()
    if existing:
        raise BadRequestError(f"Category '{name}' already exists.")

    category = WishlistCategory(itinerary_id=itinerary_id, name=name)
    db.session.add(category)
    db.session.commit()
    return category


def create_wishlist_item(category_id: int, item_data: dict, user_id: int):
    # TODO: Check if wishlist cat belongs to itinerary before continuing
    stmt = select(WishlistCategory).where(WishlistCategory.id == category_id)
    category = db.session.execute(stmt).scalar_one_or_none()
    if not category:
        raise BadRequestError("Category does not exist.")

    item = WishlistItem(
        category_id=category_id,
        name=item_data.get("name"),
        address=item_data.get("address"),
        latitude=item_data.get("latitude"),
        longitude=item_data.get("longitude"),
        description=item_data.get("description"),
        place_id=item_data.get("place_id"),
        created_by_id=user_id,
    )
    db.session.add(item)
    db.session.commit()
    return item


def delete_wishlist_item(item_id: int):
    stmt = select(WishlistItem).where(WishlistItem.id == item_id)
    item = db.session.execute(stmt).scalar_one_or_none()
    if not item:
        raise BadRequestError("Wishlist item not found.")

    # TODO check if item belongs to wishlist that belongs to itinerary before continuing
    db.session.delete(item)
    db.session.commit()
    return item_id


def promote_wishlist_item(
    itinerary_id: int, item_id: int, start_at: datetime, end_at: datetime, user_id: int
):
    stmt = (
        select(WishlistItem)
        .where(WishlistItem.id == item_id)
        .options(selectinload(WishlistItem.category))
    )
    item = db.session.execute(stmt).scalar_one_or_none()
    if not item:
        raise BadRequestError("Wishlist item not found.")

    if item.is_promoted:
        raise BadRequestError("This item has already been promoted.")

    item.is_promoted = True

    # TODO: Make longitude and latitude in events nullable to allow for non-location based events
    # TODO: Or try to get coords from place name / address
    event_data = {
        "name": item.name,
        "address": item.address or "",
        "latitude": item.latitude or 0.0,
        "longitude": item.longitude or 0.0,
        "description": item.description,
        "category": item.category.name,
        "start_at": start_at,
        "end_at": end_at,
        "created_by_id": user_id,
        "updated_by_id": user_id,
    }

    event = create_event(itinerary_id, event_data)
    return event

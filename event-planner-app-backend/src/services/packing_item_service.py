from ..extensions import db
from ..models import PackingItem
from sqlalchemy import select, or_, and_
import itineraries_service
from ..exceptions import NotFoundError


def get_packing_lists(user_id: int, itinerary_id: int):
    stmt = select(PackingItem).where(
        and_(
            PackingItem.itinerary_id == itinerary_id,
            or_(PackingItem.is_shared, PackingItem.owner_id == user_id),
        )
    )
    return db.session.execute(stmt).scalars().all()


def create_packing_item(user_id: int, itinerary_id: int, packing_item: dict):
    new_packing_item = PackingItem(
        itinerary_id=itinerary_id,
        owner_id=user_id,
        name=packing_item["name"],
        category=packing_item["category"],
        is_shared=packing_item["is_shared"],
        created_by_id=user_id,
        updated_by_id=user_id,
    )

    db.session.add(new_packing_item)

    db.session.commit()

    return new_packing_item


def get_packing_item(user_id: int, itinerary_id: int, packing_item_id: int):
    stmt = select(PackingItem).where(
        and_(
            PackingItem.id == packing_item_id,
            PackingItem.itinerary_id == itinerary_id,
            or_(PackingItem.is_shared, PackingItem.owner_id == user_id),
        )
    )
    item = db.session.execute(stmt).scalar_one_or_none()

    if not item:
        raise NotFoundError("Packing item note found")
    return item


def update_packing_item(
    user_id: int, itinerary_id: int, packing_item_id: int, packing_item_data: dict
):
    item = get_packing_item(user_id, itinerary_id, packing_item_id)

    fields = ["name", "category", "is_checked", "is_shared"]

    for k, v in packing_item_data.items():
        if k in fields:
            setattr(item, k, v)

    db.session.commit()

    return item


def delete_packing_item(user_id: int, itinerary_id: int, packing_item_id: int):
    item = get_packing_item(user_id, itinerary_id, packing_item_id)

    db.session.delete(item)
    db.session.commit()

    return packing_item_id

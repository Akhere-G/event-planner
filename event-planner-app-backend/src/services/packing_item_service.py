from sqlalchemy import and_, or_, select

from ..exceptions import NotFoundError
from ..extensions import db
from ..models import PackingItem


def get_packing_lists(user_id: int | None, itinerary_id: int):
    stmt = select(PackingItem).where(
        and_(
            PackingItem.itinerary_id == itinerary_id,
            or_(PackingItem.is_shared, PackingItem.owner_id == user_id),
        )
    )
    return db.session.execute(stmt).scalars().all()


def stage_create_packing_item(
    user_id: int | None, itinerary_id: int, packing_item: dict
):
    new_packing_item = PackingItem(
        itinerary_id=itinerary_id,
        owner_id=user_id if not packing_item["is_shared"] else None,
        name=packing_item["name"],
        category=packing_item["category"],
        is_shared=packing_item["is_shared"] if user_id else True,
        created_by_id=user_id,
        updated_by_id=user_id,
    )

    db.session.add(new_packing_item)
    db.session.flush()
    return new_packing_item


def create_packing_item(user_id: int | None, itinerary_id: int, packing_item: dict):
    try:
        new_packing_item = stage_create_packing_item(
            user_id, itinerary_id, packing_item
        )
        db.session.commit()
        return new_packing_item
    except Exception:
        db.session.rollback()
        raise


def get_packing_item(user_id: int | None, itinerary_id: int, packing_item_id: int):
    stmt = select(PackingItem).where(
        and_(
            PackingItem.id == packing_item_id,
            PackingItem.itinerary_id == itinerary_id,
            or_(PackingItem.is_shared, PackingItem.owner_id == user_id),
        )
    )
    item = db.session.execute(stmt).scalar_one_or_none()

    if not item:
        raise NotFoundError("Packing item not found")
    return item


def stage_update_packing_item(
    user_id: int | None,
    itinerary_id: int,
    packing_item_id: int,
    packing_item_data: dict,
):
    item = get_packing_item(user_id, itinerary_id, packing_item_id)

    fields = ["name", "category", "is_checked", "is_shared"]

    for k, v in packing_item_data.items():
        if k in fields:
            setattr(item, k, v)

    if "is_checked" in packing_item_data:
        item.checked_by_id = user_id if packing_item_data["is_checked"] else None

    if "is_shared" in packing_item_data and not packing_item_data["is_shared"]:
        item.owner_id = user_id

    item.updated_by_id = user_id
    db.session.flush()
    return item


def update_packing_item(
    user_id: int | None,
    itinerary_id: int,
    packing_item_id: int,
    packing_item_data: dict,
):
    try:
        item = stage_update_packing_item(
            user_id, itinerary_id, packing_item_id, packing_item_data
        )
        db.session.commit()
        return item
    except Exception:
        db.session.rollback()
        raise


def stage_delete_packing_item(
    user_id: int | None, itinerary_id: int, packing_item_id: int
):
    item = get_packing_item(user_id, itinerary_id, packing_item_id)
    db.session.delete(item)
    db.session.flush()
    return packing_item_id


def delete_packing_item(user_id: int | None, itinerary_id: int, packing_item_id: int):
    try:
        stage_delete_packing_item(user_id, itinerary_id, packing_item_id)
        db.session.commit()
        return packing_item_id
    except Exception:
        db.session.rollback()
        raise

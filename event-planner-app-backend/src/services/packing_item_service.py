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


def create_packing_item(user_id: int | None, itinerary_id: int, packing_item: dict):
    try:
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


def update_packing_item(
    user_id: int | None,
    itinerary_id: int,
    packing_item_id: int,
    packing_item_data: dict,
):
    try:
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
        db.session.commit()

        return item
    except Exception:
        db.session.rollback()
        raise


def delete_packing_item(user_id: int | None, itinerary_id: int, packing_item_id: int):
    try:
        item = get_packing_item(user_id, itinerary_id, packing_item_id)

        db.session.delete(item)
        db.session.commit()

        return packing_item_id
    except Exception:
        db.session.rollback()
        raise


def generate_and_add_packing_items(user_id: int | None, itinerary_id: int):
    from .ai_services import generate_packing_list

    try:
        generated_items = generate_packing_list(itinerary_id)
        for item in generated_items:
            name = item.get("name")
            category = item.get("category", "General")
            is_shared = bool(item.get("is_shared", False))
            if not name:
                continue
            new_item = PackingItem(
                itinerary_id=itinerary_id,
                owner_id=user_id if not is_shared else None,
                name=name,
                category=category,
                is_shared=is_shared,
                created_by_id=user_id,
                updated_by_id=user_id,
            )
            db.session.add(new_item)

        db.session.commit()
        return get_packing_lists(user_id, itinerary_id)
    except Exception:
        db.session.rollback()
        raise

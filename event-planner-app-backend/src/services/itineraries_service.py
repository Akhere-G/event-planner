from ..extensions import db
from ..models import Itinerary, ItineraryUser, UserRole
from sqlalchemy import select
from ..exceptions import UserNotAuthorisedError, ItineraryDoesNotExistError
from sqlalchemy.orm import selectinload


def get_itinerary(user_id: int, itinerary_id: int):
    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary_id)
        .where(ItineraryUser.user_id == user_id)
        .options(selectinload(ItineraryUser.itinerary))
    )

    itinerary = db.session.execute(stmt).scalar_one_or_none()

    if not itinerary:
        raise ItineraryDoesNotExistError

    return itinerary


def get_itineraries(user_id: int):
    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.user_id == user_id)
        .options(selectinload(ItineraryUser.itinerary))
    )
    return db.session.execute(stmt).scalars().all()


def create_itinerary(user_id: int, data: dict):
    new_itinerary = Itinerary(**data)
    db.session.add(new_itinerary)
    db.session.flush()

    new_membership = ItineraryUser(
        itinerary_id=new_itinerary.id, user_id=user_id, role=UserRole.ADMIN
    )

    db.session.add(new_membership)
    db.session.commit()

    return new_itinerary


def update_itinerary(user_id: int, itinerary_id: int, data: dict):
    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary_id)
        .where(ItineraryUser.user_id == user_id)
        .options(selectinload(ItineraryUser.itinerary))
    )
    membership = db.session.execute(stmt).scalar_one_or_none()

    if not membership:
        raise ItineraryDoesNotExistError()

    if membership.role != UserRole.ADMIN:
        raise UserNotAuthorisedError("You must be an admin to update this itinerary.")

    itinerary = membership.itinerary

    for k, v in data.items():
        if hasattr(itinerary, k):
            setattr(itinerary, k, v)

    db.session.commit()
    return itinerary


def delete_itinerary(user_id: int, itinerary_id: int):
    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary_id)
        .where(ItineraryUser.user_id == user_id)
        .options(selectinload(ItineraryUser.itinerary))
    )

    membership = db.session.execute(stmt).scalar_one_or_none()

    if not membership:
        raise ItineraryDoesNotExistError()

    if membership.role != UserRole.ADMIN:
        raise UserNotAuthorisedError("You must be an admin to delete this itinerary.")

    itinerary = membership.itinerary

    db.session.delete(itinerary)
    db.session.commit()

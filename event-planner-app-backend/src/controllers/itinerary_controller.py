from ..extensions import db
from ..models import User, Itinerary
from sqlalchemy import select
from ..exceptions import UserDoesNotExistError, ItineraryDoesNotExistError
from sqlalchemy.orm import selectinload


def get_itineraries(user_id: int):
    stmt = (
        select(User).where(User.id == user_id).options(selectinload(User.itineraries))
    )
    user = db.session.execute(stmt).scalar_one_or_none()

    if not user:
        raise UserDoesNotExistError()

    return user.itineraries


def create_itinerary(user_id: int, data: dict):
    stmt = select(User).where(User.id == user_id)
    user = db.session.execute(stmt).scalar_one_or_none()

    if not user:
        raise UserDoesNotExistError()

    new_itinerary = Itinerary(**data)
    user.itineraries.append(new_itinerary)
    db.session.commit()

    return new_itinerary


def update_itinerary(user_id: int, itinerary_id: int, data: dict):
    stmt = (
        select(Itinerary)
        .join(Itinerary.users)
        .where(Itinerary.id == itinerary_id)
        .where(User.id == user_id)
    )
    itinerary = db.session.execute(stmt).scalar_one_or_none()

    if not itinerary:
        raise ItineraryDoesNotExistError()

    for k, v in data.items():
        if hasattr(itinerary, k):
            setattr(itinerary, k, v)

    db.session.commit()

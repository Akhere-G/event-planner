from .itineraries_service import get_itinerary_membership, get_itinerary
from ..models import ItineraryUser
from ..extensions import db
from sqlalchemy import select
from ..models import User
from ..exceptions import (
    UserDoesNotExistError,
    UserAlreadyExistsError,
)


def get_user(email: str = None, id: str = None):
    if id:
        stmt = select(User).where(User.id == id)
    else:
        stmt = select(User).where(User.email == email)
    user = db.session.execute(stmt).scalar_one_or_none()

    if not user:
        raise UserDoesNotExistError()

    return user


def add_user_to_itinerary(itinerary_id: int, email: str, role: str):
    get_itinerary(itinerary_id)

    user = get_user(email)

    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary_id)
        .where(ItineraryUser.user_id == user.id)
    )

    membership = db.session.execute(stmt).scalar_one_or_none()

    if membership:
        raise UserAlreadyExistsError("User has already been added.")

    membership = ItineraryUser(itinerary_id=itinerary_id, user_id=user.id, role=role)

    db.session.add(membership)
    db.session.commit()
    return membership


def update_user_role(itinerary_id: int, user_id: str, new_role: str):
    get_user(id=user_id)
    membership = get_itinerary_membership(user_id, itinerary_id)
    membership.role = new_role
    db.session.commit()
    return membership

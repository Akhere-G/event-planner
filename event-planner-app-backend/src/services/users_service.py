from .itineraries_service import get_itinerary_membership
from ..models import ItineraryUser
from ..extensions import db
from sqlalchemy import select
from ..models import User
from ..exceptions import (
    UserDoesNotExistError,
    UserAlreadyExistsError,
)


def get_user(email: str):
    stmt = select(User).where(User.email == email)
    user = db.session.execute(stmt).scalar_one_or_none()

    if not user:
        raise UserDoesNotExistError()

    return user


def add_user_to_itinerary(user_id: int, itinerary_id: int, data: dict):
    get_itinerary_membership(user_id, itinerary_id)

    user = get_user(data["email"])

    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary_id)
        .where(ItineraryUser.user_id == user.id)
    )

    membership = db.session.execute(stmt).scalar_one_or_none()

    if membership:
        raise UserAlreadyExistsError("User has already been added.")

    membership = ItineraryUser(
        itinerary_id=itinerary_id, user_id=user.id, role=data["role"]
    )

    db.session.add(membership)
    db.session.commit()
    return membership

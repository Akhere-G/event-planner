from .itineraries_service import get_itinerary_membership, get_itinerary
from ..models import ItineraryUser
from ..extensions import db
from sqlalchemy import select, func
from ..models import User, UserRole
from ..exceptions import (
    UserDoesNotExistError,
    UserAlreadyExistsError,
    UserNotAuthorisedError,
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


def update_user_role(
    user_id: int, itinerary_id: int, other_user_id: str, new_role: str
):
    get_user(id=other_user_id)
    membership = get_itinerary_membership(other_user_id, itinerary_id)

    if membership.role == UserRole.ADMIN.value:
        if membership.user_id != user_id:
            raise UserNotAuthorisedError("You cannot edit the role of other admins.")
        count = db.session.execute(
            select(func.count())
            .select_from(ItineraryUser)
            .where(ItineraryUser.itinerary_id == itinerary_id)
            .where(ItineraryUser.role == UserRole.ADMIN.value)
        ).scalar_one_or_none()
        if count <= 1:
            raise UserNotAuthorisedError(
                "You cannot demote yourself when there is only one admin. Appoint another first."
            )

    membership.role = new_role
    db.session.commit()
    return membership

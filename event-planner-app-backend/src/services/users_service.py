from sqlalchemy import func, select

from ..exceptions import (
    ItineraryDoesNotExistError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
    UserNotAuthorisedError,
)
from ..extensions import db
from ..models import InvitationStatus, Invite, ItineraryUser, User, UserRole


def get_user(email: int | None = None, id: int | None = None):
    if id:
        stmt = select(User).where(User.id == id)
    else:
        stmt = select(User).where(User.email == email)
    user = db.session.execute(stmt).scalar_one_or_none()

    if not user:
        raise UserDoesNotExistError()

    return user


def add_user_to_itinerary(itinerary_id: int, user_id: int, role: UserRole):
    try:
        stmt = (
            select(ItineraryUser)
            .where(ItineraryUser.itinerary_id == itinerary_id)
            .where(ItineraryUser.user_id == user_id)
        )

        membership = db.session.execute(stmt).scalar_one_or_none()

        if membership:
            raise UserAlreadyExistsError("User has already been added.")

        membership = ItineraryUser(
            itinerary_id=itinerary_id,
            user_id=user_id,
            role=role,
            created_by_id=user_id,
            updated_by_id=user_id,
        )

        db.session.add(membership)
        return membership
    except Exception:
        db.session.rollback()
        raise


def update_user_role(
    user_id: int, itinerary_id: int, other_user_id: int, new_role: UserRole
):
    get_user(id=other_user_id)
    stmt = select(ItineraryUser).where(
        ItineraryUser.user_id == other_user_id,
        ItineraryUser.itinerary_id == itinerary_id,
    )
    membership = db.session.execute(stmt).scalar_one_or_none()

    if not membership:
        raise ItineraryDoesNotExistError()

    if membership.role == UserRole.ADMIN.value:
        if membership.user_id != user_id:
            raise UserNotAuthorisedError("You cannot edit the role of other admins.")
        count = db.session.execute(
            select(func.count())
            .select_from(ItineraryUser)
            .where(ItineraryUser.itinerary_id == itinerary_id)
            .where(ItineraryUser.role == UserRole.ADMIN.value)
        ).scalar_one_or_none()
        if count == 1:
            raise UserNotAuthorisedError(
                "You cannot demote yourself when there is only one admin. Appoint another first."
            )

    membership.role = new_role
    membership.updated_by_id = user_id
    db.session.commit()
    return membership


def remove_user(user_id: int, itinerary_id: int, other_user_id: int):
    stmt = select(ItineraryUser).where(
        ItineraryUser.user_id == other_user_id,
        ItineraryUser.itinerary_id == itinerary_id,
    )
    membership = db.session.execute(stmt).scalar_one_or_none()

    if not membership:
        raise ItineraryDoesNotExistError()

    if membership.role == UserRole.ADMIN.value:
        if membership.user_id != user_id:
            raise UserNotAuthorisedError("You cannot remove other admins.")
        count = db.session.execute(
            select(func.count())
            .select_from(ItineraryUser)
            .where(ItineraryUser.itinerary_id == itinerary_id)
            .where(ItineraryUser.role == UserRole.ADMIN.value)
        ).scalar_one_or_none()
        if count == 1:
            raise UserNotAuthorisedError(
                "You cannot remove yourself when there is only one admin. Appoint another first."
            )
    stmt = (
        select(Invite)
        .where(Invite.itinerary_id == itinerary_id)
        .where(Invite.email == membership.user.email)
    )
    invite = db.session.execute(stmt).scalar_one_or_none()
    if invite:
        invite.status = InvitationStatus.REVOKED.value

    db.session.delete(membership)
    db.session.commit()
    return other_user_id

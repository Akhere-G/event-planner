from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import contains_eager, selectinload

from ..exceptions import (
    ItineraryDoesNotExistError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
    UserNotAuthorisedError,
)
from ..extensions import db
from ..models import InvitationStatus, Invite, Itinerary, ItineraryUser, User, UserRole


def get_invite(itinerary_id: int, email: str):
    stmt = (
        select(Invite)
        .where(Invite.email == email)
        .where(Invite.itinerary_id == itinerary_id)
    )

    return db.session.execute(stmt).scalar_one_or_none()


def create_invite(data: dict):
    try:
        membership = get_membership_by_email(data["email"], data["itinerary_id"])

        if membership:
            raise UserAlreadyExistsError("This user is already part of this itinerary!")

        existing_invite = get_invite(data["itinerary_id"], email=data["email"])

        if existing_invite:
            if existing_invite.status == InvitationStatus.ACCEPTED.value:
                raise UserAlreadyExistsError("User has already accepted this invite.")

            existing_invite.status = InvitationStatus.PENDING.value
            existing_invite.role = data.get("role") or existing_invite.role
            existing_invite.expires_at = datetime.now(timezone.utc) + timedelta(days=7)
            invite = existing_invite
            invite.updated_by_id = data["updated_by_id"]
        else:
            invite = Invite(**data)
            db.session.add(invite)

        db.session.commit()

        return invite
    except Exception:
        db.session.rollback()
        raise


# TODO: simplify
def get_membership_by_email(email: str, itinerary_id: int):
    try:
        stmt = select(User).where(User.email == email)
        user = db.session.execute(stmt).scalar_one_or_none()

        if user is None:
            return None
        stmt = (
            select(ItineraryUser)
            .where(ItineraryUser.itinerary_id == itinerary_id)
            .where(ItineraryUser.user_id == user.id)
        )

        membership = db.session.execute(stmt).scalar_one_or_none()

        return membership
    except UserDoesNotExistError:
        return None


def is_user_in_itinerary(user_id: int, itinerary_id: int):
    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary_id)
        .where(ItineraryUser.user_id == user_id)
    )

    membership = db.session.execute(stmt).scalar_one_or_none()

    if not membership:
        raise ItineraryDoesNotExistError()

    return membership


def get_itinerary_membership(user_id: int, itinerary_id: int):
    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary_id)
        .where(ItineraryUser.user_id == user_id)
        .options(
            selectinload(ItineraryUser.user),
            selectinload(ItineraryUser.itinerary).options(
                selectinload(Itinerary.events),
                selectinload(Itinerary.user_memberships).selectinload(
                    ItineraryUser.user
                ),
                selectinload(Itinerary.invites),
            ),
        )
    )

    membership = db.session.execute(stmt).scalar_one_or_none()

    if not membership:
        raise ItineraryDoesNotExistError()

    return membership


def get_itinerary_count(user_id):
    stmt = (
        select(func.count())
        .select_from(ItineraryUser)
        .where(ItineraryUser.user_id == user_id)
    )

    return db.session.execute(stmt).scalar()


def get_itinerary_memberships(
    itinerary_id: int, limit: int | None = None, offset: int = 0
):
    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.itinerary_id == itinerary_id)
        .options(
            selectinload(ItineraryUser.itinerary), selectinload(ItineraryUser.user)
        )
    )

    if limit is not None and offset is not None:
        stmt = stmt.limit(limit).offset(offset)

    return db.session.execute(stmt).scalars().all()


def get_itinerary(itinerary_id: int):
    stmt = (
        select(Itinerary)
        .where(Itinerary.id == itinerary_id)
        .options(
            selectinload(Itinerary.events),
        )
    )

    itinerary = db.session.execute(stmt).scalar_one_or_none()

    if not itinerary:
        raise ItineraryDoesNotExistError()

    return itinerary


def get_itineraries(user_id: int, limit: int | None = None, offset: int = 0):
    stmt = (
        select(Itinerary, ItineraryUser.role)
        .join(Itinerary.user_memberships)
        .where(ItineraryUser.user_id == user_id)
        .order_by(Itinerary.start_date)
        .limit(limit)
        .offset(offset)
        .options(
            contains_eager(Itinerary.user_memberships).selectinload(ItineraryUser.user),
            selectinload(Itinerary.events),
        )
    )

    results = db.session.execute(stmt).unique().all()

    return [{"itinerary": row.Itinerary, "role": row.role} for row in results]


def create_itinerary(user_id: int, data: dict):
    try:
        new_itinerary = Itinerary(**data)
        db.session.add(new_itinerary)
        db.session.flush()

        new_membership = ItineraryUser(
            itinerary_id=new_itinerary.id,
            user_id=user_id,
            role=UserRole.ADMIN.value,
            created_by_id=user_id,
            updated_by_id=user_id,
        )

        db.session.add(new_membership)
        db.session.commit()

        return new_itinerary
    except Exception:
        db.session.rollback()
        raise


def is_authorised(
    user_id: int,
    itinerary_id: int,
    authorised_roles=None,
    message="You are not authorised to complete this action.",
):
    authorised_roles = authorised_roles or [UserRole.ADMIN]
    stmt = select(ItineraryUser).where(
        ItineraryUser.user_id == user_id, ItineraryUser.itinerary_id == itinerary_id
    )
    membership = db.session.execute(stmt).scalar_one_or_none()

    if not membership:
        raise ItineraryDoesNotExistError()

    if not UserRole.has_value(membership.role, authorised_roles):
        raise UserNotAuthorisedError(message)


def update_itinerary(itinerary_id: int, data: dict):
    try:
        stmt = select(Itinerary).where(Itinerary.id == itinerary_id)
        itinerary = db.session.execute(stmt).scalar_one_or_none()

        if not itinerary:
            raise ItineraryDoesNotExistError()

        for k, v in data.items():
            if hasattr(itinerary, k):
                setattr(itinerary, k, v)

        db.session.commit()
        return itinerary
    except Exception:
        db.session.rollback()
        raise


def delete_itinerary(itinerary_id: int):
    try:
        stmt = select(Itinerary).where(Itinerary.id == itinerary_id)

        itinerary = db.session.execute(stmt).scalar_one_or_none()

        if not itinerary:
            raise ItineraryDoesNotExistError()

        db.session.delete(itinerary)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

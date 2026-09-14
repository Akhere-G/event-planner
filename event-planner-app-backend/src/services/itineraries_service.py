import secrets

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from ..exceptions import (
    BadRequestError,
    ItineraryDoesNotExistError,
    UserDoesNotExistError,
    UserNotAuthorisedError,
)
from ..extensions import db
from ..models import Itinerary, ItineraryUser, User, UserRole


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


def get_itinerary_membership(
    user_id: int | None, itinerary_id: int | None, anonymous_access_code: str | None
):
    if not user_id and not anonymous_access_code:
        raise ItineraryDoesNotExistError()

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
        stmt = select(Itinerary).where(
            Itinerary.anonymous_access_code == anonymous_access_code
        )
        itinerary = db.session.execute(stmt).scalar_one_or_none()
        if not itinerary:
            raise ItineraryDoesNotExistError()
        return {"role": UserRole.ADMIN.value, "itinerary": itinerary}

    return membership


def get_itinerary_count(user_id: int):
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


def get_itineraries(
    user_id: int | None,
    limit: int | None = None,
    offset: int = 0,
    anonymous_access_code: str | None = None,
):
    if not user_id and not anonymous_access_code:
        return []

    options = [
        selectinload(Itinerary.events),
        selectinload(Itinerary.invites),
    ]

    result = []
    seen = set()

    if user_id:
        stmt = (
            select(Itinerary, ItineraryUser.role)
            .join(Itinerary.user_memberships)
            .where(ItineraryUser.user_id == user_id)
            .order_by(Itinerary.start_date)
            .limit(limit)
            .offset(offset)
            .options(*options)
        )

        for itinerary, role in db.session.execute(stmt).all():
            result.append({"itinerary": itinerary, "role": role})
            seen.add(itinerary.id)

    if anonymous_access_code:
        stmt = (
            select(Itinerary)
            .where(Itinerary.anonymous_access_code == anonymous_access_code)
            .options(*options)
        )

        for itinerary in db.session.execute(stmt).scalars():
            if itinerary.id not in seen:
                result.append({"itinerary": itinerary, "role": UserRole.ADMIN.value})

    return result


def create_itinerary(user_id: int | None, data: dict):
    try:
        new_itinerary = Itinerary(**data)
        db.session.add(new_itinerary)
        db.session.flush()

        if user_id is not None:
            new_membership = ItineraryUser(
                itinerary_id=new_itinerary.id,
                user_id=user_id,
                role=UserRole.ADMIN.value,
                created_by_id=user_id,
                updated_by_id=user_id,
            )

            db.session.add(new_membership)
        else:
            new_itinerary.is_anonymous = True
            new_itinerary.anonymous_access_code = secrets.token_urlsafe(32)
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


def save_anon_itinerary(itinerary_id: int, user_id: int):
    try:
        itinerary = get_itinerary(itinerary_id)
        if not itinerary.is_anonymous:
            raise BadRequestError("Already saved this trip!")
        itinerary.is_anonymous = False
        itinerary.anonymous_access_code = None
        itinerary.created_by_id = user_id
        itinerary.updated_by_id = user_id
        new_membership = ItineraryUser(
            itinerary_id=itinerary_id,
            user_id=user_id,
            role=UserRole.ADMIN.value,
            created_by_id=user_id,
            updated_by_id=user_id,
        )

        db.session.add(new_membership)
        db.session.commit()
        return itinerary
    except Exception:
        db.session.rollback()
        raise

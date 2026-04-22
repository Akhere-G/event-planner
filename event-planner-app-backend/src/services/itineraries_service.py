from ..extensions import db
from ..models import Itinerary, ItineraryUser, UserRole, User
from sqlalchemy import select, func
from ..exceptions import (
    UserNotAuthorisedError,
    ItineraryDoesNotExistError,
    UserDoesNotExistError,
)
from sqlalchemy.orm import selectinload, contains_eager


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

        return membership
    except UserDoesNotExistError:
        return None


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


def get_itinerary_memberships(user_id: int, limit: int = None, offset: int = 0):
    stmt = (
        select(ItineraryUser)
        .where(ItineraryUser.user_id == user_id)
        .options(
            selectinload(ItineraryUser.itinerary).options(
                selectinload(Itinerary.events),
                selectinload(Itinerary.user_memberships).selectinload(
                    ItineraryUser.user
                ),
                selectinload(Itinerary.invites),
            )
        )
        .limit(limit)
        .offset(offset)
    )
    return db.session.execute(stmt).scalars().all()


def get_itinerary(itinerary_id: int):
    stmt = (
        select(Itinerary)
        .where(Itinerary.id == itinerary_id)
        .options(
            selectinload(Itinerary.events),
            selectinload(Itinerary.user_memberships).selectinload(ItineraryUser.user),
            selectinload(Itinerary.invites),
        )
    )

    itinerary = db.session.execute(stmt).scalar_one_or_none()

    if not itinerary:
        raise ItineraryDoesNotExistError()

    return itinerary


def get_itineraries(user_id: int):
    stmt = (
        select(Itinerary)
        .join(Itinerary.user_memberships)
        .where(ItineraryUser.user_id == user_id)
        .options(
            contains_eager(Itinerary.user_memberships).selectinload(ItineraryUser.user),
            selectinload(Itinerary.events),
        )
    )

    return db.session.execute(stmt).scalars().all()


def create_itinerary(user_id: int, data: dict):
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


def is_authorised(
    user_id: int,
    itinerary_id: int,
    authorised_roles=None,
    message="You are not authorised to complete this action.",
):
    authorised_roles = authorised_roles or [UserRole.ADMIN]
    membership = get_itinerary_membership(user_id, itinerary_id)

    if not UserRole.has_value(membership.role, authorised_roles):
        raise UserNotAuthorisedError(message)


def update_itinerary(itinerary_id: int, data: dict):
    stmt = select(Itinerary).where(Itinerary.id == itinerary_id)
    itinerary = db.session.execute(stmt).scalar_one_or_none()

    if not itinerary:
        raise ItineraryDoesNotExistError()

    for k, v in data.items():
        print(k, v, itinerary.__dict__.get(k))
        if hasattr(itinerary, k):
            setattr(itinerary, k, v)

    db.session.commit()
    return itinerary


def delete_itinerary(itinerary_id: int):
    stmt = select(Itinerary).where(Itinerary.id == itinerary_id)

    itinerary = db.session.execute(stmt).scalar_one_or_none()

    if not itinerary:
        raise ItineraryDoesNotExistError()

    db.session.delete(itinerary)
    db.session.commit()

from ..extensions import db
from ..models import Itinerary, ItineraryUser, UserRole, User, Invite, InvitationStatus
from sqlalchemy import select, func
from ..exceptions import (
    UserNotAuthorisedError,
    ItineraryDoesNotExistError,
    UserDoesNotExistError,
    UserAlreadyExistsError,
)
from sqlalchemy.orm import selectinload, contains_eager
from datetime import datetime, timezone, timedelta


def get_invite(itinerary_id: int, email: str):
    stmt = (
        select(Invite)
        .where(Invite.email == email)
        .where(Invite.itinerary_id == itinerary_id)
    )

    return db.session.execute(stmt).scalar_one_or_none()


def create_invite(data: dict):
    membership = get_membership_by_email(data["email"], data["itinerary_id"])

    if membership:
        raise UserAlreadyExistsError("This user is already part of this itinerary!")

    existing_invite = get_invite(data["itinerary_id"], data["email"])
    invite = None

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


def get_itinerary_memberships(user_id: int, limit: int | None = None, offset: int = 0):
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


def join_itinerary(user_id, token):
    stmt = select(User).where(User.id == id)
    user = db.session.execute(stmt).scalar_one_or_none()

    if not user:
        raise UserDoesNotExistError()
    role = None

    stmt = select(Itinerary).where(Itinerary.viewer_code == token)
    itinerary = db.session.execute(stmt).scalar_one_or_none()

    if itinerary is not None:
        role = UserRole.VIEWER.value
    else:
        stmt = select(Itinerary).where(Itinerary.editor_code == token)
        itinerary = db.session.execute(stmt).scalar_one_or_none()
        if itinerary is not None:
            role = UserRole.EDITOR.value
        else:
            stmt = select(Itinerary).where(Itinerary.admin_code == token)
            itinerary = db.session.execute(stmt).scalar_one_or_none()
            if itinerary is not None:
                role = UserRole.ADMIN.value

    if itinerary is not None:
        return create_invite(
            {
                "email": user.email,
                "itinerary_id": itinerary.id,
                "role": role,
                "updated_by_id": user_id,
            }
        )
    else:
        raise ItineraryDoesNotExistError()

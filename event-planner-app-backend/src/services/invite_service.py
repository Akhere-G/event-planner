from datetime import datetime, timedelta, timezone

from sqlalchemy import or_, select

from ..exceptions import (
    BadRequestError,
    InviteNotFoundError,
    ItineraryDoesNotExistError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
)
from ..extensions import db
from ..models import InvitationStatus, Invite, Itinerary, User, UserRole
from .itineraries_service import get_membership_by_email
from .users_service import add_user_to_itinerary


def get_invite(
    itinerary_id: int, invite_id: int | None = None, email: str | None = None
):
    if invite_id is None and email is None:
        return None

    if invite_id:
        stmt = (
            select(Invite)
            .where(Invite.id == invite_id)
            .where(Invite.itinerary_id == itinerary_id)
        )
    else:
        stmt = (
            select(Invite)
            .where(Invite.email == email)
            .where(Invite.itinerary_id == itinerary_id)
        )

    return db.session.execute(stmt).scalar_one_or_none()


def get_user_invites(user_id: int):
    return (
        db.session.execute(
            select(Invite)
            .join(User, User.email == Invite.email)
            .where(User.id == user_id)
        )
        .scalars()
        .all()
    )


def get_invites(itinerary_id: int):
    stmt = select(Invite).where(Invite.itinerary_id == itinerary_id)
    return db.session.execute(stmt).scalars().all()


def create_invite(data: dict):
    try:  # TODO: remove dependency on itinerary_service
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


def revoke_invite(user_id: int, itinerary_id: int, invite_id: int):
    try:
        invite = get_invite(itinerary_id=itinerary_id, invite_id=invite_id)

        if not invite:
            raise InviteNotFoundError()

        if invite.status == InvitationStatus.ACCEPTED.value:
            raise BadRequestError("Invite has already been accepted.")

        if invite.status == InvitationStatus.DECLINED.value:
            raise BadRequestError("Invite has already been declined.")

        invite.status = InvitationStatus.REVOKED.value
        invite.updated_by_id = user_id
        db.session.commit()
        return invite
    except Exception:
        db.session.rollback()
        raise


def get_user_invite(user_id: int, token: str):
    invite = db.session.execute(
        select(Invite)
        .join(User, User.email == Invite.email)
        .where(User.id == user_id)
        .where(Invite.token == token)
    ).scalar_one_or_none()

    if not invite:
        raise InviteNotFoundError()

    return invite


def accept_invite(user_id: int, token: str):
    try:
        invite = get_user_invite(user_id, token)

        expires_at = invite.expires_at

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        else:
            expires_at = expires_at.astimezone(timezone.utc)

        now = datetime.now(timezone.utc)

        if expires_at < now:
            raise BadRequestError("Invite is expired.")

        if invite.status == InvitationStatus.ACCEPTED.value:
            raise BadRequestError("Invite has already been accepted.")

        if invite.status == InvitationStatus.DECLINED.value:
            raise BadRequestError("Invite has already been declined.")

        if invite.status == InvitationStatus.REVOKED.value:
            raise BadRequestError("Invite has been revoked.")

        invite.status = InvitationStatus.ACCEPTED.value
        invite.updated_by_id = user_id

        membership = add_user_to_itinerary(invite.itinerary_id, user_id, invite.role)
        db.session.commit()
        return membership
    except Exception:
        db.session.rollback()
        raise


def decline_invite(user_id: int, token: str):
    try:
        invite = get_user_invite(user_id, token)

        if invite.status == InvitationStatus.ACCEPTED.value:
            raise BadRequestError("Invite has already been accepted.")

        if invite.status == InvitationStatus.DECLINED.value:
            raise BadRequestError("Invite has already been declined.")

        if invite.status == InvitationStatus.REVOKED.value:
            raise BadRequestError("Invite has been revoked.")

        invite.status = InvitationStatus.DECLINED.value
        invite.updated_by_id = user_id

        db.session.commit()
        return invite
    except Exception:
        db.session.rollback()
        raise


def join_itinerary(user_id: int, token: str):
    try:
        user = db.session.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()

        if not user:
            raise UserDoesNotExistError()

        itinerary = db.session.execute(
            select(Itinerary).where(
                or_(
                    Itinerary.viewer_code == token,
                    Itinerary.editor_code == token,
                    Itinerary.admin_code == token,
                )
            )
        ).scalar_one_or_none()

        if not itinerary:
            raise ItineraryDoesNotExistError()

        if itinerary.viewer_code == token:
            role = UserRole.VIEWER.value
        elif itinerary.editor_code == token:
            role = UserRole.EDITOR.value
        else:
            role = UserRole.ADMIN.value

        existing_invite = get_invite(
            itinerary_id=itinerary.id,
            email=user.email,
        )

        if existing_invite:
            raise UserAlreadyExistsError()

        return create_invite(
            {
                "email": user.email,
                "itinerary_id": itinerary.id,
                "role": role,
                "created_by_id": user_id,
                "updated_by_id": user_id,
                "inviter_id": user_id,
            }
        )

    except Exception:
        db.session.rollback()
        raise

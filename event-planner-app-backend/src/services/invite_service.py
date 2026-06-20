from ..extensions import db
from .itineraries_service import get_itinerary
from .users_service import add_user_to_itinerary
from ..models import Invite, InvitationStatus, User, Itinerary, UserRole
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from ..exceptions import (
    UserAlreadyExistsError,
    InviteNotFoundError,
    BadRequestError,
    UserDoesNotExistError,
    ItineraryDoesNotExistError,
)
from .itineraries_service import get_membership_by_email


def get_invite(
    itinerary_id: int, invite_id: int | None = None, email: str | None = None
):
    if not invite_id and not email:
        return None

    stmt = None

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
    return db.session.execute(
        select(Invite).join(User, User.email == Invite.email).where(User.id == user_id)
    ).scalars()


def get_invites(itinerary_id: int):
    itinerary = get_itinerary(itinerary_id)
    return itinerary.invites


def create_invite(data: dict):
    membership = get_membership_by_email(data["email"], data["itinerary_id"])

    if membership:
        raise UserAlreadyExistsError("This user is already part of this itinerary!")

    existing_invite = get_invite(data["itinerary_id"], email=data["email"])
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


def revoke_invite(user_id: int, itinerary_id: int, invite_id: int):
    invite = get_invite(itinerary_id=itinerary_id, invite_id=invite_id)

    if not invite:
        raise InviteNotFoundError()

    invite.status = InvitationStatus.REVOKED.value
    invite.updated_by_id = user_id
    db.session.commit()

    return invite


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
    invite = get_user_invite(user_id, token)

    if invite.expires_at < datetime.now():
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


def decline_invite(user_id: int, token: str):
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


def join_itinerary(user_id, token):
    print("In service")
    stmt = select(User).where(User.id == user_id)
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
        stmt = select(Invite).where(
            Invite.itinerary_id == itinerary.id, Invite.email == user.email
        )
        existing_invite = db.session.execute(stmt).scalars().all()

        if len(existing_invite) > 0:
            raise UserAlreadyExistsError()
            # return existing_invite

        print("exisitng service")
        return create_invite(
            {
                "email": user.email,
                "itinerary_id": itinerary.id,
                "role": role,
                "updated_by_id": user_id,
                "inviter_id": user_id,
            }
        )
    else:
        raise ItineraryDoesNotExistError()

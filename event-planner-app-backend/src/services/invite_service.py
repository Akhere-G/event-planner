from ..extensions import db
from .itineraries_service import get_itinerary
from ..models import Invite, InvitationStatus
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from ..exceptions import UserAlreadyExistsError


def get_invite(itinerary_id: int, invite_id: int = None, email: str = None):
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


def get_invites(itinerary_id):
    itinerary = get_itinerary(itinerary_id)
    return itinerary.invites


def create_invite(data):
    existing_invite = get_invite(data["itinerary_id"], email=data["email"])
    invite = None

    if existing_invite:
        if existing_invite.status == InvitationStatus.ACCEPTED.value:
            raise UserAlreadyExistsError("User has already accepted this invite.")

        existing_invite.status = InvitationStatus.PENDING.value
        existing_invite.expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        invite = existing_invite
    else:
        invite = Invite(**data)
        db.session.add(invite)

    db.session.commit()

    return invite

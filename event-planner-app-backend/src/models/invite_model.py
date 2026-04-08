from ..extensions import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey, Enum, DateTime
from .itinerary_user_model import UserRole
import enum
from datetime import datetime, timedelta
import secrets


class InvitationStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"
    REVOKED = "revoked"


class Invite(Base):
    __tablename__ = "itinerary_invitations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE")
    )
    email: Mapped[str] = mapped_column(String)
    inviter_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.VIEWER)
    status: Mapped[InvitationStatus] = mapped_column(
        Enum(InvitationStatus), default=InvitationStatus.PENDING
    )
    token: Mapped[str] = mapped_column(
        String(100), unique=True, default=lambda: secrets.token_urlsafe(32)
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now() + timedelta(days=7)
    )
    itinerary: Mapped["Itinerary"] = relationship("Itinerary", back_populates="invites")  # type: ignore  # noqa: F821

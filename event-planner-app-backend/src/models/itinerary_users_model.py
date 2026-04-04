from ..extensions import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Enum
import enum


class UserRole(enum.Enum):
    ADMIN = "Admin"
    EDITOR = "Editor"
    VIEWER = "Viewer"


class ItineraryUser(Base):
    __tablename__ = "itinerary_users"

    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.VIEWER)

    user: Mapped["User"] = relationship(back_populates="itinerary_memberships")  # type: ignore  # noqa: F821
    itinerary: Mapped["Itinerary"] = relationship(back_populates="user_memberships")  # type: ignore  # noqa: F821

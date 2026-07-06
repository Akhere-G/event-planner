from ..extensions import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Enum
import enum
from .audit_mixins import AuditMixin


class UserRole(enum.Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

    @classmethod
    def has_value(cls, value, values: list["UserRole"] | None = None):
        lst = values or cls
        return value in [role.value for role in lst]


class ItineraryUser(Base, AuditMixin):
    __tablename__ = "itinerary_users"

    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[UserRole] = mapped_column(
        Enum("admin", "editor", "viewer", name="userrole"),
        default=UserRole.VIEWER.value,
    )

    user: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User",
        back_populates="itinerary_memberships",
        foreign_keys="[ItineraryUser.user_id]",
    )
    itinerary: Mapped["Itinerary"] = relationship(back_populates="user_memberships")  # type: ignore  # noqa: F821
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[ItineraryUser.created_by_id]", overlaps="user"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[ItineraryUser.updated_by_id]", overlaps="user,creator"
    )

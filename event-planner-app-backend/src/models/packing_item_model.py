from ..extensions import Base
from sqlalchemy import Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .audit_mixins import AuditMixin
from .itinerary_model import Itinerary
from .user_model import User
from typing import Optional


class PackingItem(Base, AuditMixin):
    __tablename__ = "packing_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    owner_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        default=None,
    )
    name: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(50))
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)

    is_checked: Mapped[bool] = mapped_column(Boolean, default=False)
    checked_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), default=None, nullable=True
    )
    checked_by: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[checked_by_id]
    )  # type: ignore # noqa: F821
    itinerary: Mapped["Itinerary"] = relationship(
        "Itinerary", back_populates="packing_items"
    )  # type: ignore # noqa: F821
    user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[owner_id])  # type: ignore # noqa: F821

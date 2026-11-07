from typing import Any, Optional

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from .audit_mixins import AuditMixin


class TripTemplate(Base, AuditMixin):
    """A public, anonymised snapshot of a trip that anyone can clone.

    ``ops`` uses the change-set op format, with all times relative to the trip
    start (see ``template_service``).
    """

    __tablename__ = "trip_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    itinerary_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("itineraries.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
    )
    author_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    destination: Mapped[str] = mapped_column(String(255), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    timezone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    duration_days: Mapped[int] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    clone_count: Mapped[int] = mapped_column(Integer, default=0)
    ops: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    author: Mapped[Optional["User"]] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[TripTemplate.author_id]"
    )

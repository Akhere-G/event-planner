from datetime import date

from sqlalchemy import (
    Date,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from .audit_mixins import AuditMixin
from .itinerary_model import Itinerary


class Accommodation(Base, AuditMixin):
    __tablename__ = "accommodations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, index=True)
    end_date: Mapped[date] = mapped_column(Date)

    itinerary: Mapped["Itinerary"] = relationship(back_populates="accommodations")
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Accommodation.created_by_id]"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Accommodation.updated_by_id]"
    )

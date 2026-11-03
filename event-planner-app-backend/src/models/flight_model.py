from datetime import datetime
from typing import List, Optional

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from .audit_mixins import AuditMixin


class Flight(Base, AuditMixin):
    __tablename__ = "flights"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    airline: Mapped[str] = mapped_column(String(255))
    flight_number: Mapped[str] = mapped_column(String(16))
    departure_airport: Mapped[str] = mapped_column(String(3))
    arrival_airport: Mapped[str] = mapped_column(String(3))
    departure_timezone: Mapped[str] = mapped_column(String(64))
    arrival_timezone: Mapped[str] = mapped_column(String(64))
    depart_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    arrive_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    booking_ref: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    seat: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    travellers: Mapped[List[int]] = mapped_column(JSON, default=list)

    # Reserved for a later live flight-status integration.
    status: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    status_updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    terminal: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    gate: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    itinerary: Mapped["Itinerary"] = relationship(back_populates="flights")  # type: ignore  # noqa: F821
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Flight.created_by_id]"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Flight.updated_by_id]"
    )

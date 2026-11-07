from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from .audit_mixins import AuditMixin


class Flight(Base, AuditMixin):
    __tablename__ = "flights"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    airline: Mapped[str] = mapped_column(String(3))
    flight_number: Mapped[str] = mapped_column(String(5))
    departure_airport_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("airports.id"), nullable=False, index=True
    )
    arrival_airport_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("airports.id"), nullable=False, index=True
    )
    depart_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    arrive_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    departure_airport: Mapped["Airport"] = relationship(  # type: ignore # noqa: F821
        "Airport", foreign_keys=[departure_airport_id]
    )
    arrival_airport: Mapped["Airport"] = relationship(  # type: ignore # noqa: F821
        "Airport", foreign_keys=[arrival_airport_id]
    )
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Flight.created_by_id]"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Flight.updated_by_id]"
    )
    itinerary: Mapped["Itinerary"] = relationship("Itinerary", back_populates="flights")  # type: ignore  # noqa: F821

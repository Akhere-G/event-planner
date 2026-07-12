from ..extensions import Base
from sqlalchemy import (
    Integer,
    String,
    Float,
    ForeignKey,
    Date,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .audit_mixins import AuditMixin
from datetime import date
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

    # Relationships
    itinerary: Mapped["Itinerary"] = relationship(back_populates="accommodations")

from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..extensions import Base


class TemplateRegion(StrEnum):
    AFRICA = "Africa"
    ASIA = "Asia"
    EUROPE = "Europe"
    NORTH_AMERICA = "North America"
    OCEANIA = "Oceania"
    SOUTH_AMERICA = "South America"


class TripTemplate(Base):
    """A public snapshot of a trip that anyone can browse and clone.

    ``ops`` holds create ops in the change-set format, with every time relative to
    the trip start: a day offset plus wall-clock time in the trip's timezone.
    """

    __tablename__ = "trip_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True)
    itinerary_id: Mapped[int | None] = mapped_column(
        ForeignKey("itineraries.id", ondelete="SET NULL"), unique=True
    )
    author_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    destination: Mapped[str] = mapped_column(String(255), index=True)
    region: Mapped[str] = mapped_column(String(32), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    timezone: Mapped[str | None] = mapped_column(String(64))
    duration_days: Mapped[int] = mapped_column(Integer)
    cover_image: Mapped[str | None] = mapped_column(String(255))
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    clone_count: Mapped[int] = mapped_column(Integer, default=0)
    ops: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

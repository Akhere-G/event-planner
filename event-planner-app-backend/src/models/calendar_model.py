from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base


def _utc_now() -> datetime:
    return datetime.now(UTC)


class CalendarConnection(Base):
    """A user's Google account link; the refresh token is stored Fernet-encrypted."""

    __tablename__ = "calendar_connections"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    encrypted_refresh_token: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=_utc_now, onupdate=_utc_now
    )


class TripCalendar(Base):
    """One user's dedicated Google calendar for a trip, plus its sync state."""

    __tablename__ = "trip_calendars"
    __table_args__ = (UniqueConstraint("user_id", "itinerary_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    google_calendar_id: Mapped[str] = mapped_column(String(255))
    sync_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    channel_id: Mapped[str | None] = mapped_column(
        String(64), unique=True, nullable=True
    )
    channel_token: Mapped[str | None] = mapped_column(String(64), nullable=True)
    channel_resource_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    channel_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utc_now)

    itinerary: Mapped["Itinerary"] = relationship()  # type: ignore  # noqa: F821
    links: Mapped[list["CalendarLink"]] = relationship(
        back_populates="trip_calendar",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class CalendarLink(Base):
    """Ties one app row to the Google event that mirrors it in a trip calendar."""

    __tablename__ = "calendar_links"
    __table_args__ = (
        UniqueConstraint("trip_calendar_id", "entity", "entity_id"),
        UniqueConstraint("trip_calendar_id", "google_event_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_calendar_id: Mapped[int] = mapped_column(
        ForeignKey("trip_calendars.id", ondelete="CASCADE"), index=True
    )
    entity: Mapped[str] = mapped_column(String(32))
    entity_id: Mapped[int] = mapped_column(Integer)
    google_event_id: Mapped[str] = mapped_column(String(255))
    etag: Mapped[str] = mapped_column(String(255))
    # The row's own updated_at when it was last known to match Google.
    updated_at: Mapped[datetime] = mapped_column(DateTime)

    trip_calendar: Mapped[TripCalendar] = relationship(back_populates="links")

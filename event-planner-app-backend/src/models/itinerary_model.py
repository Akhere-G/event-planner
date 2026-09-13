import secrets
from datetime import date
from typing import List, Optional

from sqlalchemy import Boolean, Date, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from .audit_mixins import AuditMixin
from .event_model import Event


class Itinerary(Base, AuditMixin):
    __tablename__ = "itineraries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    destination: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    timezone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, index=True)
    end_date: Mapped[date] = mapped_column(Date)
    viewer_code: Mapped[str] = mapped_column(
        String(255), default=lambda: secrets.token_urlsafe(32)
    )
    is_anonymous: Mapped[Boolean] = mapped_column(Boolean, default=False)
    anonymous_access_code: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    editor_code: Mapped[str] = mapped_column(
        String(255), default=lambda: secrets.token_urlsafe(32)
    )
    admin_code: Mapped[str] = mapped_column(
        String(255), default=lambda: secrets.token_urlsafe(32)
    )

    user_memberships: Mapped[List["ItineraryUser"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="itinerary", cascade="all, delete-orphan", passive_deletes=True
    )

    events: Mapped[List[Event]] = relationship(
        back_populates="itinerary",
        cascade="all, delete-orphan",
        order_by="Event.start_at",
        passive_deletes=True,
    )

    wishlists: Mapped[List["Wishlist"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="itinerary", cascade="all, delete-orphan", passive_deletes=True
    )

    invites: Mapped[List["Invite"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="itinerary", cascade="all, delete-orphan", passive_deletes=True
    )
    accommodations: Mapped[List["Accommodation"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="itinerary", cascade="all, delete-orphan", passive_deletes=True
    )
    packing_items: Mapped[List["PackingItem"]] = relationship(  # type: ignore  # noqa: F821
        "PackingItem",
        back_populates="itinerary",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Itinerary.created_by_id]"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Itinerary.updated_by_id]"
    )

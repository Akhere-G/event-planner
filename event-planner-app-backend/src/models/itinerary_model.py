from ..extensions import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Date
from datetime import date
from typing import Optional
from typing import List
from .audit_mixins import AuditMixin


class Itinerary(Base, AuditMixin):
    __tablename__ = "itineraries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String(255))
    start_date: Mapped[date] = mapped_column(Date, index=True)
    end_date: Mapped[date] = mapped_column(Date)

    user_memberships: Mapped[List["ItineraryUser"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="itinerary", cascade="all, delete-orphan"
    )

    events: Mapped[List["Event"]] = relationship(  # type: ignore  # noqa: F821
        secondary="itinerary_events", order_by="Event.start_at"
    )

    invites: Mapped[List["Invite"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="itinerary", cascade="all, delete-orphan"
    )
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Itinerary.created_by_id]"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Itinerary.updated_by_id]"
    )

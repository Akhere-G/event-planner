from typing import List, Optional

from sqlalchemy import JSON, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from .audit_mixins import AuditMixin

TRIP_TYPES = ("solo", "couple", "friends", "family")
BUDGET_TIERS = ("budget", "mid", "luxury")
PACE_OPTIONS = ("relaxed", "balanced", "packed")
TRANSPORT_OPTIONS = ("walking", "public_transport", "driving", "cycling")

# The only keys a client may ever set on a TripPreferences row.
EDITABLE_FIELDS = (
    "trip_type",
    "group_size",
    "vibes",
    "budget_tier",
    "pace",
    "interests",
    "transport",
)


class TripPreferences(Base, AuditMixin):
    __tablename__ = "trip_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("itineraries.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )
    trip_type: Mapped[Optional[str]] = mapped_column(
        Enum(*TRIP_TYPES, name="triptype"), nullable=True
    )
    group_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vibes: Mapped[List[str]] = mapped_column(JSON, default=list)
    budget_tier: Mapped[Optional[str]] = mapped_column(
        Enum(*BUDGET_TIERS, name="budgettier"), nullable=True
    )
    pace: Mapped[Optional[str]] = mapped_column(
        Enum(*PACE_OPTIONS, name="trippace"), nullable=True
    )
    interests: Mapped[List[str]] = mapped_column(JSON, default=list)
    transport: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    itinerary: Mapped["Itinerary"] = relationship(  # type: ignore  # noqa: F821
        "Itinerary", back_populates="preferences"
    )

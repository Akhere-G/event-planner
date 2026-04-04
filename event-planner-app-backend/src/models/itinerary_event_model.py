from sqlalchemy import Table, Column, ForeignKey
from ..extensions import Base

itinerary_events = Table(
    "itinerary_events",
    Base.metadata,
    Column(
        "itinerary_id",
        ForeignKey("itineraries.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("event_id", ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
)

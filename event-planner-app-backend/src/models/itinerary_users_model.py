from ..extensions import Base
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import ForeignKey


class ItineraryUsers(Base):
    __tablename__ = "itinerary_users"
    itineray_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

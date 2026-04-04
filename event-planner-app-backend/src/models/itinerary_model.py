from ..extensions import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Date
from datetime import date
from typing import Optional
from typing import List


class Itinerary(Base):
    __tablename__ = "itineraries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String(255))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[date] = mapped_column(Date, default=date.today)

    users: Mapped[List["User"]] = relationship(  # type: ignore  # noqa: F821
        secondary="itinerary_users", back_populates="itineraries"
    )

from ..extensions import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String
from typing import List


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True)
    password: Mapped[str] = mapped_column(String(256))

    itinerary_memberships: Mapped[List["ItineraryUser"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="user"
    )

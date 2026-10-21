from ..extensions import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Boolean, Integer, String, DateTime
from typing import List
from datetime import datetime, timezone


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(256))
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    itinerary_memberships: Mapped[List["ItineraryUser"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="user",
        foreign_keys="[ItineraryUser.user_id]",
        passive_deletes=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

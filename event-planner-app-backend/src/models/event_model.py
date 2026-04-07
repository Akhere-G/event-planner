from ..extensions import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, DateTime, Enum, Float
from datetime import datetime
from typing import Optional
import enum


class EventStatus(enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"


class EventSource(enum.Enum):
    CUSTOM = "custom"


class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    location: Mapped[str] = mapped_column(String)
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[datetime] = mapped_column(DateTime)
    category: Mapped[str] = mapped_column(String)
    min_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    event_status: Mapped[EventStatus] = mapped_column(
        Enum("active", "cancelled", "postponed", name="eventstatus"),
        default=EventStatus.ACTIVE,
    )
    price: Mapped[float] = mapped_column(Float)
    event_source: Mapped[EventSource] = mapped_column(
        Enum("custom", name="eventsource"),
    )
    image_url: Mapped[Optional[str]] = mapped_column(String(255))
    external_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, unique=True
    )
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

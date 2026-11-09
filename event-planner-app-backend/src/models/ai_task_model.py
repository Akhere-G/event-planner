from enum import StrEnum
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from .audit_mixins import AuditMixin


class AiTaskStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    READY = "ready"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    FAILED = "failed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    EMPTY = "empty"


ACTIVE_STATUSES = (AiTaskStatus.QUEUED, AiTaskStatus.RUNNING)
FINISHED_STATUSES = (
    AiTaskStatus.ACCEPTED,
    AiTaskStatus.REJECTED,
    AiTaskStatus.FAILED,
    AiTaskStatus.CANCELLED,
    AiTaskStatus.EXPIRED,
    AiTaskStatus.EMPTY,
)


class AiTask(Base, AuditMixin):
    """One background AI job. `created_by_id` is the requester (null when anonymous)."""

    __tablename__ = "ai_tasks"
    __table_args__ = (
        Index("ix_ai_tasks_itinerary_status", "itinerary_id", "status"),
        Index("ix_ai_tasks_requester_status", "created_by_id", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    # Validated against the handler registry, so a new type needs no migration.
    type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(
        String(20), default=AiTaskStatus.QUEUED.value, index=True
    )

    params: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    result_ops: Mapped[list[dict[str, Any | None]]] = mapped_column(JSON, nullable=True)
    applied_counts: Mapped[dict[str, int | None]] = mapped_column(JSON, nullable=True)

    progress_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    progress_current: Mapped[int | None] = mapped_column(Integer, nullable=True)
    progress_total: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    attempts: Mapped[int] = mapped_column(Integer, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3)
    heartbeat_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    cloud_task_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    itinerary: Mapped["Itinerary"] = relationship(  # type: ignore  # noqa: F821
        "Itinerary", back_populates="ai_tasks"
    )

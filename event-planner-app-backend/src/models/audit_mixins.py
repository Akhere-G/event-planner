from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional


class AuditMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    created_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    updated_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

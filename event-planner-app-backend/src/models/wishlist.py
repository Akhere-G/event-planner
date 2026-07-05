from ..extensions import Base
from sqlalchemy import (
    Integer,
    String,
    Float,
    ForeignKey,
    UniqueConstraint,
    DateTime,
    Boolean,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

# TODO: Add audit_mixin


class WishlistCategory(Base):
    __tablename__ = "wishlist_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(100))

    # Relationships
    items: Mapped[list["WishlistItem"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        UniqueConstraint("itinerary_id", "name", name="uq_itinerary_category_name"),
    )


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("wishlist_categories.id", ondelete="CASCADE"), index=True
    )

    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    place_id: Mapped[str] = mapped_column(String(255), nullable=True)

    is_promoted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    category: Mapped["WishlistCategory"] = relationship(back_populates="items")

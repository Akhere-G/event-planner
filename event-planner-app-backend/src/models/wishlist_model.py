from sqlalchemy import (
    Boolean,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from . import User
from .audit_mixins import AuditMixin

# TODO: add creator and last editor relationships


class Wishlist(Base, AuditMixin):
    __tablename__ = "wishlist_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(100))

    items: Mapped[list["WishlistItem"]] = relationship(
        back_populates="wishlist",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Wishlist.created_by_id]"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Wishlist.updated_by_id]"
    )

    __table_args__ = (
        UniqueConstraint("itinerary_id", "name", name="uq_itinerary_wishlist_name"),
    )


class WishlistItem(Base, AuditMixin):
    __tablename__ = "wishlist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    wishlist_id: Mapped[int] = mapped_column(
        ForeignKey("wishlist_categories.id", ondelete="CASCADE"), index=True
    )

    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    place_id: Mapped[str] = mapped_column(String(255), nullable=True)
    is_promoted: Mapped[bool] = mapped_column(Boolean, default=False)

    wishlist: Mapped["Wishlist"] = relationship(back_populates="items")
    votes: Mapped[list["WishlistItemVote"]] = relationship(
        back_populates="wishlist_item"
    )
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[WishlistItem.created_by_id]"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[WishlistItem.updated_by_id]"
    )


class WishlistItemVote(Base, AuditMixin):
    __tablename__ = "wishlist_item_votes"
    wishlist_item_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("wishlist_items.id", ondelete="CASCADE"),
        index=True,
        primary_key=True,
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        primary_key=True,
    )
    is_thumbs_up: Mapped[bool] = mapped_column(Boolean)

    wishlist_item: Mapped["WishlistItem"] = relationship(back_populates="votes")
    user: Mapped["User"] = relationship(foreign_keys="[WishlistItemVote.user_id]")
    creator: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[WishlistItemVote.created_by_id]"
    )
    last_editor: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[WishlistItemVote.updated_by_id]"
    )

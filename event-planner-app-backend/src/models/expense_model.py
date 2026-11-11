import enum
from datetime import date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import Base
from ..utils.currency import BASE_CURRENCY
from .audit_mixins import AuditMixin
from .itinerary_model import Itinerary


class ExpenseCategory(enum.Enum):
    LODGING = "lodging"
    FOOD = "food"
    ACTIVITIES = "activities"
    TRANSPORT = "transport"
    SHOPPING = "shopping"
    OTHER = "other"


class SplitType(enum.Enum):
    EVEN_ALL = "even_all"
    SELECTED = "selected"
    SELF = "self"


class Expense(Base, AuditMixin):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    description: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(32), default="other")
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default=BASE_CURRENCY.value)
    amount_gbp: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    fx_rate: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("1"))
    spent_on: Mapped[date] = mapped_column(Date, index=True)
    paid_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    # An item carries at most one expense, so each link is unique.
    event_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("events.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )
    accommodation_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("accommodations.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )
    flight_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("flights.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )
    split_type: Mapped[str] = mapped_column(String(16), default="even_all")

    itinerary: Mapped["Itinerary"] = relationship("Itinerary")
    # No passive_deletes on the other side: deleting an item nulls these links
    # through the ORM, so the change tracker sees the expense change.
    event: Mapped[Optional["Event"]] = relationship(  # type: ignore  # noqa: F821
        "Event", back_populates="expense"
    )
    accommodation: Mapped[Optional["Accommodation"]] = relationship(  # type: ignore  # noqa: F821
        "Accommodation", back_populates="expense"
    )
    flight: Mapped[Optional["Flight"]] = relationship(  # type: ignore  # noqa: F821
        "Flight", back_populates="expense"
    )
    shares: Mapped[List["ExpenseShare"]] = relationship(
        "ExpenseShare",
        back_populates="expense",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ExpenseShare.user_id",
    )
    paid_by: Mapped["User"] = relationship("User", foreign_keys=[paid_by_id])  # type: ignore  # noqa: F821
    creator: Mapped[Optional["User"]] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Expense.created_by_id]"
    )
    last_editor: Mapped[Optional["User"]] = relationship(  # type: ignore  # noqa: F821
        "User", foreign_keys="[Expense.updated_by_id]"
    )


class ExpenseShare(Base):
    __tablename__ = "expense_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    expense_id: Mapped[int] = mapped_column(
        ForeignKey("expenses.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    amount_gbp: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    expense: Mapped["Expense"] = relationship("Expense", back_populates="shares")
    user: Mapped["User"] = relationship("User")  # type: ignore  # noqa: F821


class Settlement(Base, AuditMixin):
    __tablename__ = "settlements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), index=True
    )
    from_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    to_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    amount_gbp: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    settled_on: Mapped[date] = mapped_column(Date)

    from_user: Mapped["User"] = relationship("User", foreign_keys=[from_user_id])  # type: ignore  # noqa: F821
    to_user: Mapped["User"] = relationship("User", foreign_keys=[to_user_id])  # type: ignore  # noqa: F821

import datetime as dt
from decimal import Decimal

from sqlalchemy import Date, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from ..extensions import Base


class ExchangeRate(Base):
    """What one unit of ``base`` was worth in ``quote`` on ``date``."""

    __tablename__ = "exchange_rates"

    date: Mapped[dt.date] = mapped_column(Date, primary_key=True)
    base: Mapped[str] = mapped_column(String(3), primary_key=True)
    quote: Mapped[str] = mapped_column(String(3), primary_key=True)
    rate: Mapped[Decimal] = mapped_column(Numeric(18, 8))

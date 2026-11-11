from contextlib import suppress
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from ..exceptions import FxUnavailableError
from ..extensions import cache, db
from ..models import ExchangeRate
from ..utils.clock import utcnow
from .fx_provider import FrankfurterProvider, RateProvider

LATEST_FRESH_FOR = timedelta(days=1)
LATEST_KEPT_FOR_SECONDS = int(timedelta(days=7).total_seconds())

_provider: RateProvider = FrankfurterProvider()


def get_rate(base: str, quote: str, on: date) -> Decimal:
    """Rate to turn one ``base`` into ``quote`` on ``on``.

    Rates are cached per day in the database. Nothing is committed here: the
    caller's commit keeps the cached rows, and a rollback only loses a cache entry.
    A date with no published rate (weekend, holiday) gets the previous business
    day's, and a future date gets today's. If the rate is neither cached nor
    fetchable this raises FxUnavailableError, so a guessed rate is never stored.
    """
    if base == quote:
        return Decimal(1)

    today = utcnow().date()
    on = min(on, today)
    cached = _cached_rate(on, base, quote)
    if cached is not None:
        return cached

    published = _provider.get_rate(base, quote, on)
    _store_rate(published.on, base, quote, published.rate)
    # Today's own entry is left out until the ECB has published it, so an
    # earlier day's rate is never frozen under today's date.
    if published.on != on and on < today:
        _store_rate(on, base, quote, published.rate)
    return published.rate


def get_latest_rates(base: str) -> dict[str, Decimal]:
    """Latest rates from ``base``, shared through the app cache for a day.

    A stale copy is served if the provider is down; with no copy at all this
    raises FxUnavailableError.
    """
    key = f"fx:latest:{base}"
    entry = cache.get(key)
    if entry and utcnow() - entry["fetched_at"] < LATEST_FRESH_FOR:
        return entry["rates"]

    try:
        rates = _provider.get_latest(base)
    except FxUnavailableError:
        if entry:
            return entry["rates"]
        raise

    cache.set(
        key,
        {"rates": rates, "fetched_at": utcnow()},
        timeout=LATEST_KEPT_FOR_SECONDS,
    )
    return rates


def _cached_rate(on: date, base: str, quote: str) -> Decimal | None:
    stmt = select(ExchangeRate.rate).where(
        ExchangeRate.date == on,
        ExchangeRate.base == base,
        ExchangeRate.quote == quote,
    )
    rate = db.session.execute(stmt).scalar_one_or_none()
    return None if rate is None else Decimal(rate)


def _store_rate(on: date, base: str, quote: str, rate: Decimal) -> None:
    if _cached_rate(on, base, quote) is not None:
        return
    # A savepoint, so losing a race to another request that cached the same
    # rate does not roll back the caller's own pending work.
    with suppress(IntegrityError), db.session.begin_nested():
        db.session.add(ExchangeRate(date=on, base=base, quote=quote, rate=rate))

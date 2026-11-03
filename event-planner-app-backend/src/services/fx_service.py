import time
from datetime import date
from decimal import Decimal

import requests
from sqlalchemy import select

from ..exceptions import BadRequestError, FxUnavailableError
from ..extensions import db
from ..models import ExchangeRate

FRANKFURTER_URL = "https://api.frankfurter.dev/v1"
REQUEST_TIMEOUT_SECONDS = 5
LATEST_TTL_SECONDS = 24 * 60 * 60

# Currencies published by the ECB, which is what Frankfurter serves.
SUPPORTED_CURRENCIES = frozenset(
    "AUD BGN BRL CAD CHF CNY CZK DKK EUR GBP HKD HUF IDR ILS INR ISK JPY KRW MXN "
    "MYR NOK NZD PHP PLN RON SEK SGD THB TRY USD ZAR".split()
)

_latest_cache: dict[str, tuple[float, dict[str, Decimal]]] = {}


def normalise_currency(code: str) -> str:
    code = (code or "").upper()
    if code not in SUPPORTED_CURRENCIES:
        raise BadRequestError(f"{code or 'That currency'} is not a supported currency.")
    return code


def _fetch(path: str, base: str, symbols: str | None = None) -> dict:
    params = {"base": base}
    if symbols:
        params["symbols"] = symbols
    try:
        response = requests.get(
            f"{FRANKFURTER_URL}/{path}", params=params, timeout=REQUEST_TIMEOUT_SECONDS
        )
        response.raise_for_status()
        body = response.json()
        if not isinstance(body.get("rates"), dict):
            raise ValueError("Missing rates")
        return body
    except (requests.RequestException, ValueError) as exc:
        raise FxUnavailableError() from exc


def _cached_rate(on: date, base: str, quote: str) -> Decimal | None:
    stmt = select(ExchangeRate.rate).where(
        ExchangeRate.date == on, ExchangeRate.base == base, ExchangeRate.quote == quote
    )
    return db.session.execute(stmt).scalar_one_or_none()


def _store_rate(on: date, base: str, quote: str, rate: Decimal):
    if _cached_rate(on, base, quote) is not None:
        return
    db.session.add(ExchangeRate(date=on, base=base, quote=quote, rate=rate))
    db.session.flush()


def get_rate(base: str, quote: str, on: date) -> Decimal:
    """Rate to turn one ``base`` into ``quote`` on ``on``.

    Weekends and holidays have no ECB fixing, so Frankfurter answers with the
    previous business day's rate; we cache that under the requested date too so
    the lookup is a single query next time. Raises FxUnavailableError if the rate
    is neither cached nor fetchable, so we never guess a number.
    """
    base, quote = normalise_currency(base), normalise_currency(quote)
    if base == quote:
        return Decimal("1")

    on = min(on, date.today())
    cached = _cached_rate(on, base, quote)
    if cached is not None:
        return Decimal(cached)

    body = _fetch(on.isoformat(), base, quote)
    raw = body["rates"].get(quote)
    if raw is None:
        raise FxUnavailableError()
    rate = Decimal(str(raw))
    try:
        _store_rate(on, base, quote, rate)
        published = date.fromisoformat(body["date"]) if body.get("date") else on
        if published != on:
            _store_rate(published, base, quote, rate)
        db.session.commit()
    except Exception:
        db.session.rollback()
    return rate


def get_latest_rates(base: str) -> dict[str, Decimal]:
    """Latest rates for every supported currency, cached in memory for a day.

    A stale copy is served if the API is down; with no copy at all we raise.
    """
    base = normalise_currency(base)
    now = time.monotonic()
    hit = _latest_cache.get(base)
    if hit and now - hit[0] < LATEST_TTL_SECONDS:
        return hit[1]
    try:
        body = _fetch("latest", base)
    except FxUnavailableError:
        if hit:
            return hit[1]
        raise
    rates = {
        code: Decimal(str(value))
        for code, value in body["rates"].items()
        if code in SUPPORTED_CURRENCIES
    }
    rates[base] = Decimal("1")
    _latest_cache[base] = (now, rates)
    return rates


def clear_latest_cache():
    _latest_cache.clear()

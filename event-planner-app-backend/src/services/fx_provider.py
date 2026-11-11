from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date
from decimal import Decimal, InvalidOperation

import requests

from ..exceptions import FxUnavailableError
from ..utils.currency import Currency

FRANKFURTER_URL = "https://api.frankfurter.dev/v2"
REQUEST_TIMEOUT_SECONDS = 5
# Reference rates from the European Central Bank, not Frankfurter's blended feed.
RATE_SOURCE = "ecb"


@dataclass(frozen=True, slots=True)
class PublishedRate:
    """A rate and the day it was published, which is earlier than the day asked
    for on weekends and holidays."""

    on: date
    rate: Decimal


class RateProvider(ABC):
    @abstractmethod
    def get_rate(self, base: str, quote: str, on: date) -> PublishedRate:
        """Rate to turn one ``base`` into ``quote`` as of ``on``.

        Raises FxUnavailableError if the provider cannot answer.
        """

    @abstractmethod
    def get_latest(self, base: str) -> dict[str, Decimal]:
        """The latest rate from ``base`` to every supported currency."""


class FrankfurterProvider(RateProvider):
    def get_rate(self, base: str, quote: str, on: date) -> PublishedRate:
        body = self._get(f"rate/{base}/{quote}", {"date": on.isoformat()})
        try:
            return PublishedRate(
                on=date.fromisoformat(body["date"]),
                rate=Decimal(str(body["rate"])),
            )
        except (KeyError, TypeError, ValueError, InvalidOperation) as exc:
            raise FxUnavailableError from exc

    def get_latest(self, base: str) -> dict[str, Decimal]:
        rows = self._get("rates", {"base": base})
        supported = frozenset(Currency)
        rates = {base: Decimal(1)}
        try:
            for row in rows:
                if row["quote"] in supported:
                    rates[row["quote"]] = Decimal(str(row["rate"]))
        except (KeyError, TypeError, InvalidOperation) as exc:
            raise FxUnavailableError from exc
        return rates

    def _get(self, path: str, params: dict[str, str]):
        try:
            response = requests.get(
                f"{FRANKFURTER_URL}/{path}",
                params={**params, "providers": RATE_SOURCE},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            return response.json()
        except (requests.RequestException, ValueError) as exc:
            raise FxUnavailableError from exc

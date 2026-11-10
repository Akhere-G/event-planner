from collections.abc import Iterable
from typing import ClassVar

from .base import FlightApiProvider, FlightNumberProvider
from .oag import OagFlightProvider
from .serpapi import SerpApiFlightProvider


def _create_configured(provider_classes: Iterable[type]) -> list:
    configured = []
    for provider_class in provider_classes:
        provider = provider_class()
        if provider.is_configured():
            configured.append(provider)
    return configured


class FlightProviderFactory:
    """Builds the configured route-search providers, in the order they are tried."""

    PROVIDERS: ClassVar[list[type[FlightApiProvider]]] = [SerpApiFlightProvider]

    @classmethod
    def create_all(cls) -> list[FlightApiProvider]:
        return _create_configured(cls.PROVIDERS)


class FlightNumberProviderFactory:
    """Builds the configured flight-number providers, in the order they are tried."""

    PROVIDERS: ClassVar[list[type[FlightNumberProvider]]] = [OagFlightProvider]

    @classmethod
    def create_all(cls) -> list[FlightNumberProvider]:
        return _create_configured(cls.PROVIDERS)

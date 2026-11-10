from typing import ClassVar

from .base import FlightApiProvider
from .serpapi import SerpApiFlightProvider


class FlightProviderFactory:
    """Builds the configured flight providers, in the order they should be tried."""

    PROVIDERS: ClassVar[list[type[FlightApiProvider]]] = [SerpApiFlightProvider]

    @classmethod
    def create_all(cls) -> list[FlightApiProvider]:
        configured = []
        for provider_class in cls.PROVIDERS:
            provider = provider_class()
            if provider.is_configured():
                configured.append(provider)
        return configured

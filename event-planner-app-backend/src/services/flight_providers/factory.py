from .base import FlightApiProvider
from .serpapi import SerpApiFlightProvider


class FlightProviderFactory:
    """Builds the configured flight providers, in the order they should be tried."""

    PROVIDERS: list[type[FlightApiProvider]] = [SerpApiFlightProvider]

    @classmethod
    def create_all(cls) -> list[FlightApiProvider]:
        providers = (provider_class() for provider_class in cls.PROVIDERS)
        return [provider for provider in providers if provider.is_configured()]

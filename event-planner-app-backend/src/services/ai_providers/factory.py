from typing import ClassVar

from .base import AiProvider
from .bedrock import BedrockProvider
from .gemini import GeminiProvider
from .groq import GroqProvider


class AiProviderFactory:
    """Builds the AI providers, in the order they are tried."""

    PROVIDERS: ClassVar[list[type[AiProvider]]] = [
        GeminiProvider,
        GroqProvider,
        BedrockProvider,
    ]

    @classmethod
    def create_all(cls) -> list[AiProvider]:
        providers = []
        for provider_class in cls.PROVIDERS:
            providers.append(provider_class())
        return providers

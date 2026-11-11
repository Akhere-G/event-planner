import logging
from collections.abc import Sequence

from ...exceptions import AIProviderError
from .base import AiProvider

logger = logging.getLogger(__name__)


def generate_with_fallback(prompt: str, providers: Sequence[AiProvider]) -> str:
    """Return the first non-empty answer, trying the available providers in order."""
    for provider in providers:
        if not provider.is_available():
            continue

        try:
            text = provider.generate(prompt)
        except Exception:
            logger.exception("%s request failed.", provider.name)
            continue

        if text:
            return text

        logger.warning("%s returned an empty response.", provider.name)

    raise AIProviderError("All AI providers failed.")

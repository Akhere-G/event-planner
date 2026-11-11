from abc import ABC, abstractmethod


class AiProvider(ABC):
    """Adapter between a third-party AI model API and a plain prompt-to-text call."""

    name: str

    @abstractmethod
    def is_available(self) -> bool:
        """Whether the provider has the settings it needs to run."""

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Return the model's text, or an empty string when it had nothing to say.

        Raises when the provider cannot answer.
        """

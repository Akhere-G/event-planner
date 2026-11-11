import logging
import os

from groq import Groq

from ...exceptions import AIResponseError
from .base import AiProvider
from .prompts import JSON_ONLY_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

MODEL = "openai/gpt-oss-20b"
MAX_COMPLETION_TOKENS = 8192000
TIMEOUT_SECONDS = 100.0


class GroqProvider(AiProvider):
    name = "Groq"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.getenv("GROQ_API_KEY")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def generate(self, prompt: str) -> str:
        completion = Groq(api_key=self.api_key).chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": JSON_ONLY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_completion_tokens=MAX_COMPLETION_TOKENS,
            timeout=TIMEOUT_SECONDS,
        )

        choice = completion.choices[0]
        logger.info(
            "Groq response: finish_reason=%s, completion_tokens=%s",
            choice.finish_reason,
            completion.usage.completion_tokens,
        )

        if choice.finish_reason == "length":
            raise AIResponseError("Groq response was truncated by the token limit.")

        return choice.message.content or ""

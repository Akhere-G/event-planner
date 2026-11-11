import os

from google import genai
from google.genai import types as genai_types

from .base import AiProvider

MODEL = "gemini-3.5-flash"
TIMEOUT_MILLISECONDS = 100000


class GeminiProvider(AiProvider):
    name = "Gemini"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def generate(self, prompt: str) -> str:
        client = genai.Client(
            api_key=self.api_key,
            http_options=genai_types.HttpOptions(timeout=TIMEOUT_MILLISECONDS),
        )
        response = client.models.generate_content(model=MODEL, contents=prompt)
        return response.text or ""

import logging
from typing import TypedDict

from ...config.bedrock_config import BedrockSettings
from ...exceptions import AIResponseError
from .base import AiProvider
from .bedrock_client import bedrock_runtime_client
from .prompts import JSON_ONLY_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

TRUNCATED_STOP_REASON = "max_tokens"


class ContentBlock(TypedDict, total=False):
    text: str


def _joined_text(content_blocks: list[ContentBlock]) -> str:
    texts = []
    for block in content_blocks:
        if "text" in block:
            texts.append(block["text"])
    return "".join(texts)


class BedrockProvider(AiProvider):
    name = "Bedrock"

    def __init__(self, settings: BedrockSettings | None = None) -> None:
        self.settings = settings or BedrockSettings.from_env()

    def is_available(self) -> bool:
        return self.settings.is_complete

    def generate(self, prompt: str) -> str:
        response = bedrock_runtime_client(self.settings).converse(
            modelId=self.settings.model_id,
            system=[{"text": JSON_ONLY_SYSTEM_PROMPT}],
            messages=[{"role": "user", "content": [{"text": prompt}]}],
        )

        logger.info("Bedrock response: stop_reason=%s", response["stopReason"])

        if response["stopReason"] == TRUNCATED_STOP_REASON:
            raise AIResponseError("Bedrock response was truncated by the token limit.")

        return _joined_text(response["output"]["message"]["content"])

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class BedrockSettings:
    region: str | None
    model_id: str | None
    access_key_id: str | None = None
    secret_access_key: str | None = None

    @classmethod
    def from_env(cls) -> "BedrockSettings":
        return cls(
            region=os.getenv("AWS_REGION"),
            model_id=os.getenv("BEDROCK_CHAT_MODEL_ID"),
            access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )

    @property
    def is_complete(self) -> bool:
        return bool(self.region and self.model_id)

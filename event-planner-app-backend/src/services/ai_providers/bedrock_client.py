from functools import lru_cache

import boto3
from botocore.client import BaseClient
from botocore.config import Config

from ...config.bedrock_config import BedrockSettings

CLIENT_CONFIG = {
    "connect_timeout": 5,
    "read_timeout": 60,
    "retries": {"mode": "adaptive", "max_attempts": 5},
}


@lru_cache
def bedrock_runtime_client(settings: BedrockSettings) -> BaseClient:
    return boto3.client(
        "bedrock-runtime",
        region_name=settings.region,
        aws_access_key_id=settings.access_key_id,
        aws_secret_access_key=settings.secret_access_key,
        config=Config(**CLIENT_CONFIG),
    )

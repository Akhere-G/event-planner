from unittest.mock import patch

import pytest
from src.config.bedrock_config import BedrockSettings
from src.services.ai_providers.bedrock_client import bedrock_runtime_client


@pytest.fixture(autouse=True)
def clear_client_cache():
    bedrock_runtime_client.cache_clear()
    yield
    bedrock_runtime_client.cache_clear()


def test_settings_are_read_from_the_environment(monkeypatch):
    monkeypatch.setenv("AWS_REGION", "eu-central-1")
    monkeypatch.setenv("BEDROCK_CHAT_MODEL_ID", "model-id")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "key-id")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "secret")

    assert BedrockSettings.from_env() == BedrockSettings(
        region="eu-central-1",
        model_id="model-id",
        access_key_id="key-id",
        secret_access_key="secret",
    )


@pytest.mark.parametrize(
    ("region", "model_id", "complete"),
    [
        ("eu-central-1", "model-id", True),
        (None, "model-id", False),
        ("eu-central-1", None, False),
        (None, None, False),
    ],
)
def test_settings_are_complete_only_with_a_region_and_model(region, model_id, complete):
    assert BedrockSettings(region, model_id).is_complete is complete


def test_client_is_a_runtime_client_in_the_configured_region():
    settings = BedrockSettings("eu-west-2", "model-id", "key-id", "secret")

    with patch("src.services.ai_providers.bedrock_client.boto3.client") as create:
        bedrock_runtime_client(settings)

    args, kwargs = create.call_args
    assert args == ("bedrock-runtime",)
    assert kwargs["region_name"] == "eu-west-2"
    assert kwargs["aws_access_key_id"] == "key-id"
    assert kwargs["aws_secret_access_key"] == "secret"
    assert kwargs["config"].read_timeout == 60
    assert kwargs["config"].retries == {"mode": "adaptive", "max_attempts": 5}


def test_client_is_cached_per_settings():
    settings = BedrockSettings("eu-west-2", "model-id")

    with patch(
        "src.services.ai_providers.bedrock_client.boto3.client",
        side_effect=[object(), object()],
    ) as create:
        first = bedrock_runtime_client(settings)
        second = bedrock_runtime_client(settings)
        other = bedrock_runtime_client(BedrockSettings("us-east-1", "model-id"))

    assert first is second
    assert other is not first
    assert create.call_count == 2

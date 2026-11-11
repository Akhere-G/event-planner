from unittest.mock import MagicMock, patch

import pytest
from src.config.bedrock_config import BedrockSettings
from src.exceptions import AIResponseError
from src.services.ai_providers.bedrock import BedrockProvider
from src.services.ai_providers.prompts import JSON_ONLY_SYSTEM_PROMPT

SETTINGS = BedrockSettings("eu-central-1", "model-id")


def converse_reply(blocks, stop_reason="end_turn"):
    return {
        "output": {"message": {"role": "assistant", "content": blocks}},
        "stopReason": stop_reason,
    }


def fake_client_replying(reply):
    client = MagicMock()
    client.converse.return_value = reply
    patcher = patch(
        "src.services.ai_providers.bedrock.bedrock_runtime_client",
        return_value=client,
    )
    return patcher, client


def test_is_available_only_with_a_region_and_model(monkeypatch):
    monkeypatch.delenv("AWS_REGION", raising=False)
    monkeypatch.delenv("BEDROCK_CHAT_MODEL_ID", raising=False)
    assert not BedrockProvider().is_available()

    monkeypatch.setenv("AWS_REGION", "eu-central-1")
    monkeypatch.setenv("BEDROCK_CHAT_MODEL_ID", "model-id")
    assert BedrockProvider().is_available()


def test_is_unavailable_without_a_model():
    assert not BedrockProvider(BedrockSettings("eu-central-1", None)).is_available()


def test_generate_converses_with_the_model_and_returns_the_text():
    patcher, client = fake_client_replying(converse_reply([{"text": "Hello."}]))

    with patcher as create_client:
        result = BedrockProvider(SETTINGS).generate("Suggest something.")

    assert result == "Hello."
    create_client.assert_called_once_with(SETTINGS)
    client.converse.assert_called_once_with(
        modelId="model-id",
        system=[{"text": JSON_ONLY_SYSTEM_PROMPT}],
        messages=[{"role": "user", "content": [{"text": "Suggest something."}]}],
    )


def test_generate_joins_text_blocks_and_ignores_other_blocks():
    patcher, _ = fake_client_replying(
        converse_reply(
            [
                {"reasoningContent": {"reasoningText": {"text": "thinking"}}},
                {"text": '{"a": '},
                {"text": "1}"},
            ]
        )
    )

    with patcher:
        assert BedrockProvider(SETTINGS).generate("prompt") == '{"a": 1}'


def test_generate_returns_an_empty_string_when_there_is_no_text():
    patcher, _ = fake_client_replying(converse_reply([]))

    with patcher:
        assert BedrockProvider(SETTINGS).generate("prompt") == ""


def test_generate_raises_when_the_response_was_truncated():
    patcher, _ = fake_client_replying(
        converse_reply([{"text": "{"}], stop_reason="max_tokens")
    )

    with patcher, pytest.raises(AIResponseError):
        BedrockProvider(SETTINGS).generate("prompt")


def test_generate_lets_client_errors_propagate():
    patcher, client = fake_client_replying(None)
    client.converse.side_effect = RuntimeError("throttled")

    with patcher, pytest.raises(RuntimeError, match="throttled"):
        BedrockProvider(SETTINGS).generate("prompt")

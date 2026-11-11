from unittest.mock import MagicMock, patch

import pytest
from src.exceptions import AIResponseError
from src.services.ai_providers.groq import GroqProvider
from src.services.ai_providers.prompts import JSON_ONLY_SYSTEM_PROMPT


def completion(content, finish_reason="stop"):
    choice = MagicMock(finish_reason=finish_reason)
    choice.message.content = content
    return MagicMock(choices=[choice])


def groq_client_replying(reply):
    client = MagicMock()
    client.chat.completions.create.return_value = reply
    return patch("src.services.ai_providers.groq.Groq", return_value=client), client


def test_is_available_only_with_an_api_key(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    assert not GroqProvider().is_available()

    monkeypatch.setenv("GROQ_API_KEY", "key")
    assert GroqProvider().is_available()


def test_generate_sends_the_json_only_system_prompt_and_returns_the_content():
    patcher, client = groq_client_replying(completion("Groq says hello."))

    with patcher:
        result = GroqProvider(api_key="key").generate("Suggest something.")

    assert result == "Groq says hello."
    messages = client.chat.completions.create.call_args.kwargs["messages"]
    assert messages == [
        {"role": "system", "content": JSON_ONLY_SYSTEM_PROMPT},
        {"role": "user", "content": "Suggest something."},
    ]


def test_generate_returns_an_empty_string_when_there_is_no_content():
    patcher, _ = groq_client_replying(completion(None))

    with patcher:
        assert GroqProvider(api_key="key").generate("Suggest something.") == ""


def test_generate_raises_when_the_response_was_truncated():
    patcher, _ = groq_client_replying(completion("{", finish_reason="length"))

    with patcher, pytest.raises(AIResponseError):
        GroqProvider(api_key="key").generate("Suggest something.")

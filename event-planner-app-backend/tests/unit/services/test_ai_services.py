from unittest.mock import MagicMock, patch

import pytest
from src.exceptions import AIProviderError
from src.services.ai_services import format_json, get_ai_response


def test_format_json_parses_plain_json():
    result = format_json('{"name": "Museum", "category": "sightseeing"}')
    assert result == {"name": "Museum", "category": "sightseeing"}


def test_format_json_parses_markdown_fenced_json():
    raw = '```json\n[{"name": "Museum"}]\n```'
    result = format_json(raw)
    assert result == [{"name": "Museum"}]


def test_format_json_raises_on_invalid_json():
    with pytest.raises(ValueError):
        format_json("not json at all")


def test_format_json_raises_on_non_string_input():
    with pytest.raises(ValueError):
        format_json(123)  # type: ignore[arg-type]


@pytest.fixture
def no_provider_settings(monkeypatch):
    for name in (
        "GEMINI_API_KEY",
        "GROQ_API_KEY",
        "AWS_REGION",
        "BEDROCK_CHAT_MODEL_ID",
    ):
        monkeypatch.delenv(name, raising=False)


def test_get_ai_response_returns_gemini_text_when_available(
    no_provider_settings, monkeypatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "fake-gemini-key")

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = MagicMock(
        text="Gemini says hello."
    )

    with patch(
        "src.services.ai_providers.gemini.genai.Client", return_value=mock_client
    ):
        result = get_ai_response("Suggest something.")

    assert result == "Gemini says hello."
    mock_client.models.generate_content.assert_called_once()


def test_get_ai_response_falls_back_to_groq_when_gemini_fails(
    no_provider_settings, monkeypatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "fake-gemini-key")
    monkeypatch.setenv("GROQ_API_KEY", "fake-groq-key")

    mock_groq_message = MagicMock()
    mock_groq_message.content = "Groq says hello."
    mock_groq_completion = MagicMock()
    mock_groq_completion.choices = [MagicMock(message=mock_groq_message)]

    mock_groq_client = MagicMock()
    mock_groq_client.chat.completions.create.return_value = mock_groq_completion

    with (
        patch(
            "src.services.ai_providers.gemini.genai.Client",
            side_effect=Exception("Gemini unavailable"),
        ),
        patch("src.services.ai_providers.groq.Groq", return_value=mock_groq_client),
    ):
        result = get_ai_response("Suggest something.")

    assert result == "Groq says hello."


def test_get_ai_response_falls_back_to_bedrock_when_the_others_fail(
    no_provider_settings, monkeypatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "fake-gemini-key")
    monkeypatch.setenv("GROQ_API_KEY", "fake-groq-key")
    monkeypatch.setenv("AWS_REGION", "eu-central-1")
    monkeypatch.setenv("BEDROCK_CHAT_MODEL_ID", "model-id")

    bedrock_client = MagicMock()
    bedrock_client.converse.return_value = {
        "output": {"message": {"content": [{"text": "Bedrock says hello."}]}},
        "stopReason": "end_turn",
    }

    with (
        patch(
            "src.services.ai_providers.gemini.genai.Client",
            side_effect=Exception("Gemini unavailable"),
        ),
        patch(
            "src.services.ai_providers.groq.Groq",
            side_effect=Exception("Groq unavailable"),
        ),
        patch(
            "src.services.ai_providers.bedrock.bedrock_runtime_client",
            return_value=bedrock_client,
        ),
    ):
        result = get_ai_response("Suggest something.")

    assert result == "Bedrock says hello."


def test_get_ai_response_raises_when_no_provider_is_configured(no_provider_settings):
    with pytest.raises(AIProviderError):
        get_ai_response("Suggest something.")


def test_to_trip_local_converts_utc_to_wall_clock():
    from datetime import datetime, timezone

    from src.utils.trip_time import to_trip_local

    value = datetime(2026, 8, 20, 23, 30, tzinfo=timezone.utc)
    assert to_trip_local(value, "Europe/Paris") == datetime(2026, 8, 21, 1, 30)


def test_trip_local_to_utc_ignores_model_offset():
    from datetime import datetime, timezone

    from src.utils.trip_time import trip_local_to_utc

    expected = datetime(2026, 8, 21, 7, 0, tzinfo=timezone.utc)
    assert trip_local_to_utc("2026-08-21T09:00:00", "Europe/Paris") == expected
    assert trip_local_to_utc("2026-08-21T09:00:00Z", "Europe/Paris") == expected

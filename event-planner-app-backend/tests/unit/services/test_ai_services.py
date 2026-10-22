from unittest.mock import MagicMock, patch

import pytest
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


def test_get_ai_response_returns_gemini_text_when_available(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "fake-gemini-key")
    monkeypatch.setenv("GROQ_API_KEY", "")

    mock_response = MagicMock()
    mock_response.text = "Gemini says hello."

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response

    with patch("src.services.ai_services.genai.Client", return_value=mock_client):
        result = get_ai_response("Suggest something.")

    assert result == "Gemini says hello."
    mock_client.models.generate_content.assert_called_once()


def test_get_ai_response_falls_back_to_groq_when_gemini_fails(monkeypatch):
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
            "src.services.ai_services.genai.Client",
            side_effect=Exception("Gemini unavailable"),
        ),
        patch("src.services.ai_services.Groq", return_value=mock_groq_client),
    ):
        result = get_ai_response("Suggest something.")

    assert result == "Groq says hello."

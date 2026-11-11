from unittest.mock import MagicMock, patch

from src.services.ai_providers.gemini import MODEL, GeminiProvider


def test_is_available_only_with_an_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    assert not GeminiProvider().is_available()

    monkeypatch.setenv("GEMINI_API_KEY", "key")
    assert GeminiProvider().is_available()


def test_generate_returns_the_response_text():
    client = MagicMock()
    client.models.generate_content.return_value = MagicMock(text="Gemini says hello.")

    with patch("src.services.ai_providers.gemini.genai.Client", return_value=client):
        result = GeminiProvider(api_key="key").generate("Suggest something.")

    assert result == "Gemini says hello."
    client.models.generate_content.assert_called_once_with(
        model=MODEL, contents="Suggest something."
    )


def test_generate_returns_an_empty_string_when_there_is_no_text():
    client = MagicMock()
    client.models.generate_content.return_value = MagicMock(text=None)

    with patch("src.services.ai_providers.gemini.genai.Client", return_value=client):
        assert GeminiProvider(api_key="key").generate("Suggest something.") == ""

import pytest
from cryptography.fernet import Fernet

from src.calendar_sync.crypto import TokenCipher, get_token_cipher
from src.calendar_sync.settings import get_settings
from src.exceptions import CalendarNotConfiguredError


def test_cipher_round_trips_and_hides_the_plaintext():
    cipher = TokenCipher(Fernet.generate_key().decode())

    encrypted = cipher.encrypt("refresh-token")

    assert encrypted != "refresh-token"
    assert cipher.decrypt(encrypted) == "refresh-token"


def test_cipher_from_settings_uses_the_configured_key(calendar_settings):
    encrypted = get_token_cipher().encrypt("refresh-token")

    key = calendar_settings["CALENDAR_TOKEN_ENCRYPTION_KEY"]
    assert TokenCipher(key).decrypt(encrypted) == "refresh-token"


def test_settings_read_the_environment(monkeypatch):
    monkeypatch.setenv("FRONTEND_URL", "https://frontend.example.com")

    settings = get_settings()

    assert settings.client_id == "client-id"
    assert settings.webhook_url == "https://app.example.com/webhook"
    assert settings.frontend_url == "https://frontend.example.com"


def test_missing_configuration_is_reported(monkeypatch):
    monkeypatch.delenv("GOOGLE_CALENDAR_CLIENT_SECRET")

    with pytest.raises(CalendarNotConfiguredError):
        get_settings()

import pytest
from cryptography.fernet import Fernet


@pytest.fixture(autouse=True)
def calendar_settings(monkeypatch):
    values = {
        "GOOGLE_CALENDAR_CLIENT_ID": "client-id",
        "GOOGLE_CALENDAR_CLIENT_SECRET": "client-secret",
        "GOOGLE_CALENDAR_REDIRECT_URI": "https://app.example.com/callback",
        "GOOGLE_CALENDAR_WEBHOOK_URL": "https://app.example.com/webhook",
        "CALENDAR_TOKEN_ENCRYPTION_KEY": Fernet.generate_key().decode(),
    }
    for name, value in values.items():
        monkeypatch.setenv(name, value)
    return values

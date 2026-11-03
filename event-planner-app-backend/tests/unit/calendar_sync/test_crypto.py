import pytest
from cryptography.fernet import Fernet, InvalidToken

from src.calendar_sync.crypto import TokenCipher


def test_encrypted_token_round_trips_and_is_not_plaintext():
    cipher = TokenCipher(Fernet.generate_key().decode())

    encrypted = cipher.encrypt("refresh-token")

    assert encrypted != "refresh-token"
    assert cipher.decrypt(encrypted) == "refresh-token"


def test_token_encrypted_with_another_key_cannot_be_read():
    encrypted = TokenCipher(Fernet.generate_key().decode()).encrypt("refresh-token")

    with pytest.raises(InvalidToken):
        TokenCipher(Fernet.generate_key().decode()).decrypt(encrypted)

from cryptography.fernet import Fernet

from .settings import get_settings


class TokenCipher:
    """Encrypts OAuth tokens before they are written to the database."""

    def __init__(self, key: str) -> None:
        self._fernet = Fernet(key.encode())

    def encrypt(self, plaintext: str) -> str:
        return self._fernet.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        return self._fernet.decrypt(ciphertext.encode()).decode()


def get_token_cipher() -> TokenCipher:
    return TokenCipher(get_settings().encryption_key)

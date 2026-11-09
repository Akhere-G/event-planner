import os
import secrets
from functools import wraps

from flask import request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from ..exceptions import InvalidCredentialsError, UserNotAuthorisedError


def verify_google_token(token: str, audience: str) -> dict:
    return id_token.verify_oauth2_token(
        token, google_requests.Request(), audience=audience
    )


def cloud_tasks_only(f):

    @wraps(f)
    def decorated(*args, **kwargs):
        audience = os.getenv("SERVICE_BASE_URL", "").rstrip("/")
        expected_email = os.getenv("CLOUD_TASKS_SERVICE_ACCOUNT", "")
        header = request.headers.get("Authorization", "")

        # Not configured (local development): nobody may call this route.
        if not audience or not expected_email or not header.startswith("Bearer "):
            raise InvalidCredentialsError()

        try:
            claims = verify_google_token(header.removeprefix("Bearer "), audience)
        except ValueError:
            raise InvalidCredentialsError() from None

        email = claims.get("email") or ""
        if not claims.get("email_verified") or not secrets.compare_digest(
            email.encode(), expected_email.encode()
        ):
            raise UserNotAuthorisedError()

        return f(*args, **kwargs)

    return decorated

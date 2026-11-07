from urllib.parse import urlencode

import requests

from ..exceptions import GoogleCalendarApiError
from .client import TOKEN_URI
from .settings import CALENDAR_SCOPE, get_settings

AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
REVOKE_URI = "https://oauth2.googleapis.com/revoke"
REQUEST_TIMEOUT_SECONDS = 10


def build_authorization_url(state: str) -> str:
    settings = get_settings()
    params = {
        "client_id": settings.client_id,
        "redirect_uri": settings.redirect_uri,
        "response_type": "code",
        "scope": CALENDAR_SCOPE,
        # offline + consent make Google issue a refresh token on every connect.
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return f"{AUTH_URI}?{urlencode(params)}"


def exchange_code_for_refresh_token(code: str) -> str:
    settings = get_settings()
    response = requests.post(
        TOKEN_URI,
        data={
            "code": code,
            "client_id": settings.client_id,
            "client_secret": settings.client_secret,
            "redirect_uri": settings.redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    refresh_token = response.json().get("refresh_token") if response.ok else None
    if not refresh_token:
        raise GoogleCalendarApiError("Google did not grant calendar access.")
    return refresh_token


def revoke_token(token: str) -> None:
    requests.post(REVOKE_URI, data={"token": token}, timeout=REQUEST_TIMEOUT_SECONDS)

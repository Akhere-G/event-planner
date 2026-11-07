import os
from dataclasses import dataclass

from ..exceptions import CalendarNotConfiguredError

CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar"


@dataclass(frozen=True)
class CalendarSyncSettings:
    client_id: str
    client_secret: str
    redirect_uri: str
    webhook_url: str
    encryption_key: str
    frontend_url: str


def get_settings() -> CalendarSyncSettings:
    """Reads the environment on each call so configuration is never cached stale."""
    values = {
        "client_id": os.getenv("GOOGLE_CALENDAR_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CALENDAR_CLIENT_SECRET"),
        "redirect_uri": os.getenv("GOOGLE_CALENDAR_REDIRECT_URI"),
        "webhook_url": os.getenv("GOOGLE_CALENDAR_WEBHOOK_URL"),
        "encryption_key": os.getenv("CALENDAR_TOKEN_ENCRYPTION_KEY"),
    }
    if not all(values.values()):
        raise CalendarNotConfiguredError()

    return CalendarSyncSettings(
        **values,
        frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173"),
    )

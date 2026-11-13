import os
from dataclasses import dataclass

from ..exceptions import CalendarNotConfiguredError

CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar"


def _required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise CalendarNotConfiguredError()
    return value


@dataclass(frozen=True)
class CalendarSyncSettings:
    client_id: str
    client_secret: str
    redirect_uri: str
    webhook_url: str
    encryption_key: str
    frontend_url: str

    @classmethod
    def from_env(cls) -> "CalendarSyncSettings":
        return cls(
            client_id=_required("GOOGLE_CALENDAR_CLIENT_ID"),
            client_secret=_required("GOOGLE_CALENDAR_CLIENT_SECRET"),
            redirect_uri=_required("GOOGLE_CALENDAR_REDIRECT_URI"),
            webhook_url=_required("GOOGLE_CALENDAR_WEBHOOK_URL"),
            encryption_key=_required("CALENDAR_TOKEN_ENCRYPTION_KEY"),
            frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173"),
        )


def get_settings() -> CalendarSyncSettings:
    """Read on every call so a missing variable only fails calendar requests."""
    return CalendarSyncSettings.from_env()

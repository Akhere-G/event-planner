from dataclasses import dataclass
from typing import Any, Callable, Protocol, TypeVar

from google.auth.exceptions import RefreshError
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from ..exceptions import GoogleCalendarApiError
from .settings import CALENDAR_SCOPE, get_settings

TOKEN_URI = "https://oauth2.googleapis.com/token"
CHANNEL_TTL_SECONDS = 7 * 24 * 60 * 60
PAGE_SIZE = 250

T = TypeVar("T")
GoogleEvent = dict[str, Any]


class GoogleEventGoneError(Exception):
    """The Google event or calendar no longer exists."""


class SyncTokenExpiredError(Exception):
    """Google invalidated the sync token, so a full sync is required."""


class GoogleAuthRevokedError(Exception):
    """The user revoked access or the refresh token is no longer valid."""


@dataclass(frozen=True)
class EventsPage:
    events: list[GoogleEvent]
    next_sync_token: str | None


@dataclass(frozen=True)
class WatchChannel:
    resource_id: str
    expires_at_ms: int


class CalendarClient(Protocol):
    """The slice of the Google Calendar API that sync depends on."""

    def create_calendar(self, summary: str, time_zone: str | None) -> str: ...

    def insert_event(self, calendar_id: str, body: GoogleEvent) -> GoogleEvent: ...

    def update_event(
        self, calendar_id: str, event_id: str, body: GoogleEvent
    ) -> GoogleEvent: ...

    def delete_event(self, calendar_id: str, event_id: str) -> None: ...

    def list_events(self, calendar_id: str, sync_token: str | None) -> EventsPage: ...

    def watch_events(
        self, calendar_id: str, channel_id: str, token: str, address: str
    ) -> WatchChannel: ...

    def stop_channel(self, channel_id: str, resource_id: str) -> None: ...


ClientFactory = Callable[[int], CalendarClient]


def _execute(request: Any) -> Any:
    try:
        return request.execute()
    except RefreshError as exc:
        raise GoogleAuthRevokedError() from exc
    except HttpError as exc:
        if exc.resp.status in (404, 410):
            raise GoogleEventGoneError() from exc
        raise GoogleCalendarApiError() from exc


class GoogleCalendarClient:
    def __init__(self, credentials: Credentials) -> None:
        self._service = build(
            "calendar", "v3", credentials=credentials, cache_discovery=False
        )

    def create_calendar(self, summary: str, time_zone: str | None) -> str:
        body = {"summary": summary, **({"timeZone": time_zone} if time_zone else {})}
        return _execute(self._service.calendars().insert(body=body))["id"]

    def insert_event(self, calendar_id: str, body: GoogleEvent) -> GoogleEvent:
        return _execute(
            self._service.events().insert(
                calendarId=calendar_id, body=body, sendUpdates="none"
            )
        )

    def update_event(
        self, calendar_id: str, event_id: str, body: GoogleEvent
    ) -> GoogleEvent:
        return _execute(
            self._service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=body,
                sendUpdates="none",
            )
        )

    def delete_event(self, calendar_id: str, event_id: str) -> None:
        _execute(
            self._service.events().delete(
                calendarId=calendar_id, eventId=event_id, sendUpdates="none"
            )
        )

    def list_events(self, calendar_id: str, sync_token: str | None) -> EventsPage:
        events: list[GoogleEvent] = []
        page_token: str | None = None
        while True:
            request = self._service.events().list(
                calendarId=calendar_id,
                syncToken=sync_token,
                pageToken=page_token,
                singleEvents=True,
                maxResults=PAGE_SIZE,
            )
            try:
                response = _execute(request)
            except GoogleEventGoneError as exc:
                raise SyncTokenExpiredError() from exc
            events.extend(response.get("items", []))
            page_token = response.get("nextPageToken")
            if not page_token:
                return EventsPage(events, response.get("nextSyncToken"))

    def watch_events(
        self, calendar_id: str, channel_id: str, token: str, address: str
    ) -> WatchChannel:
        body = {
            "id": channel_id,
            "type": "web_hook",
            "address": address,
            "token": token,
            "params": {"ttl": str(CHANNEL_TTL_SECONDS)},
        }
        response = _execute(
            self._service.events().watch(calendarId=calendar_id, body=body)
        )
        return WatchChannel(response["resourceId"], int(response["expiration"]))

    def stop_channel(self, channel_id: str, resource_id: str) -> None:
        body = {"id": channel_id, "resourceId": resource_id}
        _execute(self._service.channels().stop(body=body))


def build_credentials(refresh_token: str) -> Credentials:
    settings = get_settings()
    return Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri=TOKEN_URI,
        client_id=settings.client_id,
        client_secret=settings.client_secret,
        scopes=[CALENDAR_SCOPE],
    )

from unittest.mock import MagicMock

import pytest
from google.auth.exceptions import RefreshError
from googleapiclient.errors import HttpError
from httplib2 import Response
from src.calendar_sync import client as client_module
from src.calendar_sync.client import (
    CHANNEL_TTL_SECONDS,
    EventsPage,
    GoogleAuthRevokedError,
    GoogleCalendarClient,
    GoogleEventGoneError,
    SyncTokenExpiredError,
    WatchChannel,
)
from src.exceptions import GoogleCalendarApiError


def http_error(status: int) -> HttpError:
    return HttpError(Response({"status": status}), b"{}")


@pytest.fixture
def service(monkeypatch):
    fake = MagicMock()
    monkeypatch.setattr(client_module, "build", lambda *_a, **_k: fake)
    return fake


@pytest.fixture
def client(service):
    return GoogleCalendarClient(credentials=MagicMock())


def fail_with(request: MagicMock, error: Exception) -> None:
    request.execute.side_effect = error


@pytest.mark.parametrize("status", [404, 410])
def test_missing_events_become_gone_errors(client, service, status):
    request = service.events.return_value.delete.return_value
    fail_with(request, http_error(status))

    with pytest.raises(GoogleEventGoneError):
        client.delete_event("cal", "evt")


def test_other_http_failures_become_api_errors(client, service):
    request = service.events.return_value.insert.return_value
    fail_with(request, http_error(500))

    with pytest.raises(GoogleCalendarApiError):
        client.insert_event("cal", {})


def test_a_revoked_grant_is_reported(client, service):
    request = service.events.return_value.patch.return_value
    fail_with(request, RefreshError("revoked"))

    with pytest.raises(GoogleAuthRevokedError):
        client.update_event("cal", "evt", {})


def test_create_calendar_sends_the_time_zone_only_when_known(client, service):
    insert = service.calendars.return_value.insert
    insert.return_value.execute.return_value = {"id": "cal-1"}

    assert client.create_calendar("Trip", "Europe/Paris") == "cal-1"
    assert insert.call_args.kwargs["body"] == {
        "summary": "Trip",
        "timeZone": "Europe/Paris",
    }

    client.create_calendar("Trip", None)
    assert insert.call_args.kwargs["body"] == {"summary": "Trip"}


def test_list_events_follows_pages_and_returns_the_sync_token(client, service):
    list_call = service.events.return_value.list
    list_call.return_value.execute.side_effect = [
        {"items": [{"id": "a"}], "nextPageToken": "page-2"},
        {"items": [{"id": "b"}], "nextSyncToken": "sync-2"},
    ]

    page = client.list_events("cal", "sync-1")

    assert page == EventsPage([{"id": "a"}, {"id": "b"}], "sync-2")
    assert list_call.call_args_list[1].kwargs["pageToken"] == "page-2"


def test_an_expired_sync_token_is_reported(client, service):
    request = service.events.return_value.list.return_value
    fail_with(request, http_error(410))

    with pytest.raises(SyncTokenExpiredError):
        client.list_events("cal", "stale")


def test_watch_events_returns_the_channel(client, service):
    watch = service.events.return_value.watch
    watch.return_value.execute.return_value = {
        "resourceId": "res-1",
        "expiration": "4000000000000",
    }

    channel = client.watch_events("cal", "chan-1", "secret", "https://app/hook")

    assert channel == WatchChannel("res-1", 4_000_000_000_000)
    body = watch.call_args.kwargs["body"]
    assert body["address"] == "https://app/hook"
    assert body["params"] == {"ttl": str(CHANNEL_TTL_SECONDS)}

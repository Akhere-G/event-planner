from datetime import UTC, datetime
from typing import Any

from src.calendar_sync.client import (
    EventsPage,
    GoogleEvent,
    GoogleEventGoneError,
    SyncTokenExpiredError,
    WatchChannel,
)
from src.extensions import db
from src.models import TripCalendar

FAR_FUTURE_MS = 4_000_000_000_000


class FakeCalendarClient:
    """In-memory stand-in for Google Calendar that records the calls it receives."""

    def __init__(self) -> None:
        self.events: dict[str, GoogleEvent] = {}
        self.feed: list[GoogleEvent] = []
        self.calls: list[tuple[str, Any]] = []
        self.sync_token_expired = False
        self._counter = 0

    def _stamp(self, event_id: str, body: GoogleEvent) -> GoogleEvent:
        self._counter += 1
        event = {
            **body,
            "id": event_id,
            "etag": f'"etag-{self._counter}"',
            "updated": datetime.now(UTC).isoformat(),
        }
        self.events[event_id] = event
        return event

    def create_calendar(self, summary: str, time_zone: str | None) -> str:
        self.calls.append(("create_calendar", summary))
        return "cal-1"

    def insert_event(self, calendar_id: str, body: GoogleEvent) -> GoogleEvent:
        self.calls.append(("insert", body["summary"]))
        return self._stamp(f"g{self._counter + 1}", body)

    def update_event(
        self, calendar_id: str, event_id: str, body: GoogleEvent
    ) -> GoogleEvent:
        self.calls.append(("update", event_id))
        if event_id not in self.events:
            raise GoogleEventGoneError()
        return self._stamp(event_id, body)

    def delete_event(self, calendar_id: str, event_id: str) -> None:
        self.calls.append(("delete", event_id))
        if self.events.pop(event_id, None) is None:
            raise GoogleEventGoneError()

    def list_events(self, calendar_id: str, sync_token: str | None) -> EventsPage:
        self.calls.append(("list", sync_token))
        if self.sync_token_expired and sync_token is not None:
            raise SyncTokenExpiredError()
        return EventsPage(self.feed, "next-token")

    def watch_events(
        self, calendar_id: str, channel_id: str, token: str, address: str
    ) -> WatchChannel:
        self.calls.append(("watch", address))
        return WatchChannel("resource-1", FAR_FUTURE_MS)

    def stop_channel(self, channel_id: str, resource_id: str) -> None:
        self.calls.append(("stop", channel_id))


def make_trip_calendar(user, itinerary) -> TripCalendar:
    trip_calendar = TripCalendar(
        user_id=user.id, itinerary_id=itinerary.id, google_calendar_id="cal-1"
    )
    db.session.add(trip_calendar)
    db.session.flush()
    return trip_calendar

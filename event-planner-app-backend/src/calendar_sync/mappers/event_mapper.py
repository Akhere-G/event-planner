from datetime import timedelta

from ...extensions import db
from ...models import Event, Itinerary
from ..client import GoogleEvent
from .base import EntitySyncMapper
from .times import from_google_time, to_google_time

DEFAULT_NAME = "Untitled event"
DEFAULT_CATEGORY = "general"


DEFAULT_DURATION = timedelta(hours=1)


def _clip(value: str | None, limit: int) -> str | None:
    return value[:limit] if value else None


class EventMapper(EntitySyncMapper):
    entity = "event"
    model = Event
    creatable_from_google = True

    def to_google(self, obj: Event) -> GoogleEvent:
        return {
            "summary": obj.name,
            "location": obj.address,
            "description": obj.description or "",
            "start": to_google_time(obj.start_at),
            "end": to_google_time(obj.end_at),
        }

    def apply_google(
        self, obj: Event, google_event: GoogleEvent, itinerary: Itinerary
    ) -> None:
        obj.name = _clip(google_event.get("summary"), 255) or obj.name
        obj.address = _clip(google_event.get("location"), 255) or obj.address
        obj.description = _clip(google_event.get("description"), 256)
        start = from_google_time(google_event["start"], itinerary.timezone)
        end = from_google_time(google_event["end"], itinerary.timezone)
        if end > start:
            obj.start_at, obj.end_at = start, end

    def create_from_google(
        self, itinerary: Itinerary, google_event: GoogleEvent
    ) -> Event:
        start = from_google_time(google_event["start"], itinerary.timezone)
        end = from_google_time(google_event["end"], itinerary.timezone)
        event = Event(
            itinerary_id=itinerary.id,
            name=_clip(google_event.get("summary"), 255) or DEFAULT_NAME,
            address=_clip(google_event.get("location"), 255) or itinerary.destination,
            latitude=itinerary.latitude,
            longitude=itinerary.longitude,
            category=DEFAULT_CATEGORY,
            description=_clip(google_event.get("description"), 256),
            start_at=start,
            end_at=end if end > start else start + DEFAULT_DURATION,
        )
        db.session.add(event)
        return event

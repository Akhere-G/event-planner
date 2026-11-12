import secrets
import uuid
from contextlib import suppress
from datetime import UTC, datetime, timedelta

from sqlalchemy import or_, select

from ..extensions import db
from ..models import TripCalendar
from .client import (
    CalendarClient,
    ClientFactory,
    GoogleAuthRevokedError,
    GoogleEventGoneError,
)
from .failures import isolate_user_failure
from .settings import get_settings

# Channels last a week; renew any that would lapse before the next daily run.
RENEW_WINDOW = timedelta(days=2)


def _naive_utc(value: datetime) -> datetime:
    return value.astimezone(UTC).replace(tzinfo=None)


def stop_watch(trip_calendar: TripCalendar, client: CalendarClient) -> None:
    if trip_calendar.channel_id is None:
        return
    with suppress(GoogleEventGoneError, GoogleAuthRevokedError):
        client.stop_channel(trip_calendar.channel_id, trip_calendar.channel_resource_id)
    trip_calendar.channel_id = None
    trip_calendar.channel_token = None
    trip_calendar.channel_resource_id = None
    trip_calendar.channel_expires_at = None


def start_watch(trip_calendar: TripCalendar, client: CalendarClient) -> None:
    """Replaces any existing channel with a fresh one for the trip calendar."""
    stop_watch(trip_calendar, client)
    channel_id = uuid.uuid4().hex
    token = secrets.token_urlsafe(32)
    channel = client.watch_events(
        trip_calendar.google_calendar_id,
        channel_id,
        token,
        get_settings().webhook_url,
    )
    trip_calendar.channel_id = channel_id
    trip_calendar.channel_token = token
    trip_calendar.channel_resource_id = channel.resource_id
    trip_calendar.channel_expires_at = _naive_utc(
        datetime.fromtimestamp(channel.expires_at_ms / 1000, UTC)
    )


def trip_calendars_needing_channel() -> list[TripCalendar]:
    cutoff = _naive_utc(datetime.now(UTC) + RENEW_WINDOW)
    stmt = select(TripCalendar).where(
        or_(
            TripCalendar.channel_expires_at.is_(None),
            TripCalendar.channel_expires_at < cutoff,
        )
    )
    return list(db.session.execute(stmt).scalars())


def renew_expiring_channels(client_for: ClientFactory) -> int:
    """Renews channels close to expiry, and creates any that are missing."""
    trip_calendars = trip_calendars_needing_channel()
    for trip_calendar in trip_calendars:
        user_id = trip_calendar.user_id
        with isolate_user_failure(user_id):
            start_watch(trip_calendar, client_for(user_id))
            db.session.commit()
    return len(trip_calendars)

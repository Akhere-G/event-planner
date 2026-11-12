import secrets

from sqlalchemy import select

from ..exceptions import UserNotAuthorisedError
from ..extensions import db
from ..models import TripCalendar
from .jobs import dispatch_job
from .jobs.calendar_jobs import PullCalendarJob

INITIAL_STATE = "sync"


def _find_trip_calendar(channel_id: str, token: str) -> TripCalendar:
    stmt = select(TripCalendar).where(TripCalendar.channel_id == channel_id)
    trip_calendar = db.session.execute(stmt).scalar_one_or_none()
    if trip_calendar is None or not secrets.compare_digest(
        trip_calendar.channel_token, token
    ):
        raise UserNotAuthorisedError()
    return trip_calendar


def handle_notification(channel_id: str, token: str, resource_state: str) -> None:
    """Accepts a Google push notification and queues a pull of the calendar.

    Notifications carry no event data, so this only triggers an incremental sync.
    """
    trip_calendar = _find_trip_calendar(channel_id, token)
    if resource_state != INITIAL_STATE:
        dispatch_job(PullCalendarJob(trip_calendar.id))

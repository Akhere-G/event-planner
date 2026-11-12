import logging
from dataclasses import dataclass

from sqlalchemy import select

from ..extensions import db
from ..models import TripCalendar
from .client import ClientFactory
from .jobs import dispatch_job
from .jobs.calendar_jobs import ReconcileCalendarJob
from .watch import renew_expiring_channels

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ScheduledSyncResult:
    channels_renewed: int
    calendars_queued: int


def run_scheduled_sync(client_for: ClientFactory) -> ScheduledSyncResult:
    """Renews expiring watch channels, then queues a catch-up of every calendar.

    The catch-up repairs notifications that never arrived, in either direction.
    """
    renewed = renew_expiring_channels(client_for)
    stmt = select(TripCalendar.id)
    trip_calendar_ids = list(db.session.execute(stmt).scalars())
    for trip_calendar_id in trip_calendar_ids:
        dispatch_job(ReconcileCalendarJob(trip_calendar_id))

    logger.info(
        "Renewed %s channel(s), queued %s calendar(s)", renewed, len(trip_calendar_ids)
    )
    return ScheduledSyncResult(renewed, len(trip_calendar_ids))

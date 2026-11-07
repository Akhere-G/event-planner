import logging

from sqlalchemy import select

from ..extensions import db
from ..models import TripCalendar
from .client import ClientFactory
from .pull import pull_trip_calendar
from .watch import renew_expiring_channels

logger = logging.getLogger(__name__)


def run_scheduled_sync(client_for: ClientFactory) -> tuple[int, int]:
    """Renews expiring watch channels, then pulls every calendar.

    The pull is the fallback for notifications that never arrived. Returns the
    number of channels renewed and calendars pulled.
    """
    renewed = renew_expiring_channels(client_for)
    ids = list(db.session.execute(select(TripCalendar.id)).scalars())
    for trip_calendar_id in ids:
        pull_trip_calendar(trip_calendar_id, client_for)
    logger.info("Renewed %s channel(s), pulled %s calendar(s)", renewed, len(ids))
    return renewed, len(ids)

from ..extensions import db
from ..models import TripCalendar
from .client import ClientFactory
from .failures import handle_user_failure
from .pull import pull_trip_calendar
from .push import push_trip
from .watch import start_watch


def bootstrap_trip_calendar(trip_calendar_id: int, client_for: ClientFactory) -> None:
    """First sync of a newly enabled trip calendar.

    Pushes everything, then pulls once so the sync token starts after our own
    events, then opens the watch channel for later changes.
    """
    trip_calendar = db.session.get(TripCalendar, trip_calendar_id)
    user_id = trip_calendar.user_id
    try:
        client = client_for(user_id)
        push_trip(trip_calendar, client)
        pull_trip_calendar(trip_calendar_id, client_for)
        start_watch(trip_calendar, client)
        db.session.commit()
    except Exception as exc:  # noqa: BLE001 - one user must not block others
        db.session.rollback()
        handle_user_failure(user_id, exc)

from ..extensions import db
from ..models import TripCalendar
from .client import ClientFactory
from .failures import isolate_user_failure
from .pull import pull_trip_calendar
from .push import push_trip


def reconcile_trip_calendar(trip_calendar_id: int, client_for: ClientFactory) -> None:
    """Catches up a trip calendar after missed notifications in either direction.

    Pulls first so a later Google edit wins, then pushes whatever the app changed
    that never reached Google.
    """
    pull_trip_calendar(trip_calendar_id, client_for)
    trip_calendar = db.session.get(TripCalendar, trip_calendar_id)
    if trip_calendar is None:
        return

    user_id = trip_calendar.user_id
    with isolate_user_failure(user_id):
        push_trip(trip_calendar, client_for(user_id))
        db.session.commit()

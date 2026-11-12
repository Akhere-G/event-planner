from sqlalchemy import select

from ..extensions import db
from ..models import TripCalendar
from .client import ClientFactory
from .connections import forget_user, read_refresh_token
from .oauth import revoke_token
from .watch import stop_watch


def disconnect_account(user_id: int, client_for: ClientFactory) -> None:
    """Stops every watch channel, revokes Google's access and forgets the token."""
    client = client_for(user_id)
    stmt = select(TripCalendar).where(TripCalendar.user_id == user_id)
    for trip_calendar in db.session.execute(stmt).scalars():
        stop_watch(trip_calendar, client)

    revoke_token(read_refresh_token(user_id))
    forget_user(user_id)

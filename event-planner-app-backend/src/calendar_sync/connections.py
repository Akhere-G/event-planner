from sqlalchemy import select

from ..exceptions import BadRequestError
from ..extensions import db
from ..models import CalendarConnection, TripCalendar
from .client import CalendarClient, GoogleCalendarClient, build_credentials
from .crypto import get_token_cipher


def get_connection(user_id: int) -> CalendarConnection | None:
    return db.session.get(CalendarConnection, user_id)


def save_refresh_token(user_id: int, refresh_token: str) -> CalendarConnection:
    encrypted = get_token_cipher().encrypt(refresh_token)
    connection = get_connection(user_id)
    if connection is None:
        connection = CalendarConnection(user_id=user_id)
        db.session.add(connection)
    connection.encrypted_refresh_token = encrypted
    db.session.commit()
    return connection


def read_refresh_token(user_id: int) -> str:
    connection = get_connection(user_id)
    if connection is None:
        raise BadRequestError("Connect Google Calendar first.")
    return get_token_cipher().decrypt(connection.encrypted_refresh_token)


def google_client_for_user(user_id: int) -> CalendarClient:
    return GoogleCalendarClient(build_credentials(read_refresh_token(user_id)))


def synced_trip_ids(user_id: int) -> list[int]:
    stmt = select(TripCalendar.itinerary_id).where(TripCalendar.user_id == user_id)
    return list(db.session.execute(stmt).scalars())


def forget_user(user_id: int) -> None:
    """Drops the stored token and every trip calendar record for a user."""
    for trip_calendar in db.session.execute(
        select(TripCalendar).where(TripCalendar.user_id == user_id)
    ).scalars():
        db.session.delete(trip_calendar)
    connection = get_connection(user_id)
    if connection is not None:
        db.session.delete(connection)
    db.session.commit()

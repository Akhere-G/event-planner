from sqlalchemy import select

from ..extensions import db
from ..models import TripPreferences
from ..models.trip_preferences_model import EDITABLE_FIELDS


def get_preferences(itinerary_id: int) -> TripPreferences | None:
    return db.session.execute(
        select(TripPreferences).where(TripPreferences.itinerary_id == itinerary_id)
    ).scalar_one_or_none()


def upsert_preferences(
    itinerary_id: int, data: dict, user_id: int | None
) -> TripPreferences:
    preferences = get_preferences(itinerary_id)

    if preferences is None:
        preferences = TripPreferences(
            itinerary_id=itinerary_id,
            vibes=[],
            interests=[],
            created_by_id=user_id,
        )
        db.session.add(preferences)

    for key in EDITABLE_FIELDS:
        if key in data:
            setattr(preferences, key, data[key])
    preferences.updated_by_id = user_id

    db.session.commit()
    return preferences

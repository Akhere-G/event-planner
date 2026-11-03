from ..extensions import db
from ..models import Itinerary
from .change_set_service import stage_change_set
from .itineraries_service import prepare_itinerary_data, stage_itinerary
from .trip_preferences_service import stage_preferences


def create_trip_from_draft(user_id: int | None, draft: dict) -> Itinerary:
    """Create a trip, its preferences and its planned items in one transaction.

    Anonymous creators (user_id None) get an access code, as with any new trip.
    """
    try:
        itinerary = stage_itinerary(
            user_id, prepare_itinerary_data(draft["trip"], user_id)
        )
        stage_preferences(itinerary.id, draft["preferences"], user_id)
        stage_change_set(itinerary.id, draft["ops"], user_id)
        db.session.commit()
        return itinerary
    except Exception:
        db.session.rollback()
        raise

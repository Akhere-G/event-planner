"""Creates an empty trip from a free-text prompt and queues its AI plan."""

import logging

from marshmallow import ValidationError

from ..exceptions import AiTaskQueueError
from ..models import Itinerary
from ..utils.clock import utcnow
from ..utils.location_utils import get_place_details
from .ai_task_service import enqueue
from .itineraries_service import create_itinerary
from .timezone_service import get_timezone_for_trip
from .trip_preferences_service import upsert_preferences
from .trip_prompt_service import TripBrief, interpret_trip_prompt

logger = logging.getLogger(__name__)

GENERATE_TRIP_TASK_TYPE = "generate_trip"


def _locate_destination(destination: str) -> dict[str, str | float]:
    try:
        return get_place_details(destination, place_type=None)
    except ValidationError:
        raise ValidationError(
            {"prompt": [f"We couldn't find {destination}. Try naming a city."]}
        ) from None


def _itinerary_data(brief: TripBrief, user_id: int | None) -> dict:
    place = _locate_destination(brief.destination)
    return {
        "name": brief.name,
        "destination": place["formatted_address"],
        "latitude": place["latitude"],
        "longitude": place["longitude"],
        "start_date": brief.start_date,
        "end_date": brief.end_date,
        "budget_amount_gbp": brief.budget_amount_gbp,
        "timezone": get_timezone_for_trip(
            place["latitude"], place["longitude"], brief.start_date
        ),
        "created_by_id": user_id,
        "updated_by_id": user_id,
    }


def _queue_plan(itinerary_id: int, user_id: int | None) -> None:
    try:
        enqueue(itinerary_id, GENERATE_TRIP_TASK_TYPE, {}, user_id)
    except AiTaskQueueError:
        # The failed task stays on the trip, where the user can retry it.
        logger.exception("Could not queue the plan for trip %s.", itinerary_id)


def create_trip_from_prompt(user_id: int | None, prompt: str) -> Itinerary:
    brief = interpret_trip_prompt(prompt, utcnow().date())
    itinerary = create_itinerary(user_id, _itinerary_data(brief, user_id))
    upsert_preferences(itinerary.id, brief.preferences, user_id)
    _queue_plan(itinerary.id, user_id)
    return itinerary

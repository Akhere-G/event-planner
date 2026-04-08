from ..extensions import db
from .itineraries_service import get_itinerary


def get_invites(itinerary_id):
    itinerary = get_itinerary(itinerary_id)
    return itinerary.invites

TRIP_CHANGED_EVENT = "trip:changed"
PRESENCE_EVENT = "presence:update"


def trip_room(itinerary_id: int) -> str:
    return f"trip:{itinerary_id}"

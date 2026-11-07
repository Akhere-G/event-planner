TRIP_CHANGED_EVENT = "trip:changed"
USER_CHANGED_EVENT = "user:changed"
PRESENCE_EVENT = "presence:update"


def trip_room(itinerary_id: int) -> str:
    return f"trip:{itinerary_id}"


def user_room(user_id: int) -> str:
    """Reaches one user's sockets wherever they are in the app."""
    return f"user:{user_id}"

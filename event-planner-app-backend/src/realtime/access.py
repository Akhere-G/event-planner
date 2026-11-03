import secrets

from sqlalchemy import select

from ..extensions import db
from ..models import Itinerary, ItineraryUser, UserRole


def resolve_trip_role(
    itinerary_id: int,
    user_id: int | None,
    access_code: str | None,
) -> str | None:
    """Return the role the caller has on a trip, or None if they have no access.

    Mirrors itinerary_access_required, but takes the credentials directly because
    a websocket cannot carry the X-Itinerary-Access-Code header.
    """
    itinerary = db.session.get(Itinerary, itinerary_id)
    if itinerary is None:
        return None

    if user_id is not None:
        membership = db.session.execute(
            select(ItineraryUser).where(
                ItineraryUser.user_id == user_id,
                ItineraryUser.itinerary_id == itinerary_id,
            )
        ).scalar_one_or_none()
        if membership:
            return membership.role  # type: ignore[return-value]

    if (
        itinerary.is_anonymous
        and access_code
        and secrets.compare_digest(access_code, itinerary.anonymous_access_code or "")
    ):
        return UserRole.ADMIN.value

    return None

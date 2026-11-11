from datetime import date, datetime, timedelta
from typing import Any

from sqlalchemy import update

from ..exceptions import UserNotAuthorisedError
from ..extensions import db
from ..models import Itinerary, ItineraryUser, TripTemplate, User, UserRole
from ..schemas.trip_template_schema import TIME_FORMAT
from ..utils.trip_time import trip_local_to_utc
from .change_set_service import apply_change_set
from .template_service import get_public_template

UTC_ISO_FORMAT = "%Y-%m-%dT%H:%M:%SZ"
ITINERARY_DESCRIPTION_LENGTH = 255


def _materialise_event(
    data: dict[str, Any], start_date: date, timezone_name: str | None
) -> dict[str, Any]:
    def local_to_utc(offset: int, time_text: str) -> str:
        wall_clock = datetime.combine(
            start_date + timedelta(days=offset),
            datetime.strptime(time_text, TIME_FORMAT).time(),
        )
        return trip_local_to_utc(wall_clock, timezone_name).strftime(UTC_ISO_FORMAT)

    shifted = dict(data)
    shifted["start_at"] = local_to_utc(
        shifted.pop("day_offset"), shifted.pop("start_time")
    )
    shifted["end_at"] = local_to_utc(
        shifted.pop("end_day_offset"), shifted.pop("end_time")
    )
    return shifted


def _materialise_accommodation(
    data: dict[str, Any], start_date: date, timezone_name: str | None
) -> dict[str, Any]:
    shifted = dict(data)
    shifted["start_date"] = (
        start_date + timedelta(days=shifted.pop("start_day_offset"))
    ).isoformat()
    shifted["end_date"] = (
        start_date + timedelta(days=shifted.pop("end_day_offset"))
    ).isoformat()
    return shifted


_MATERIALISERS = {
    "event": _materialise_event,
    "accommodation": _materialise_accommodation,
}


def materialise_ops(
    ops: list[dict[str, Any]], start_date: date, timezone_name: str | None
) -> list[dict[str, Any]]:
    """Shift relative ops onto ``start_date`` and turn local times into UTC."""
    absolute = []
    for op in ops:
        materialise = _MATERIALISERS.get(op["entity"])
        data = (
            materialise(op["data"], start_date, timezone_name)
            if materialise
            else op["data"]
        )
        absolute.append({"op": "create", "entity": op["entity"], "data": data})
    return absolute


def _reject_demo_user(user_id: int) -> None:
    user = db.session.get(User, user_id)
    if user is not None and user.is_demo:
        raise UserNotAuthorisedError("Create an account to clone this template.")


def clone_template(slug: str, user_id: int, start_date: date) -> Itinerary:
    """Create a trip from a template, with every item, in a single transaction."""
    _reject_demo_user(user_id)
    template = get_public_template(slug)
    absolute = materialise_ops(template.ops, start_date, template.timezone)
    description = template.description
    if description:
        description = description[:ITINERARY_DESCRIPTION_LENGTH]

    try:
        itinerary = Itinerary(
            name=template.title,
            destination=template.destination,
            latitude=template.latitude,
            longitude=template.longitude,
            description=description,
            timezone=template.timezone,
            start_date=start_date,
            end_date=start_date + timedelta(days=template.duration_days - 1),
            created_by_id=user_id,
            updated_by_id=user_id,
        )
        db.session.add(itinerary)
        db.session.flush()
        db.session.add(
            ItineraryUser(
                itinerary_id=itinerary.id,
                user_id=user_id,
                role=UserRole.ADMIN.value,
                created_by_id=user_id,
                updated_by_id=user_id,
            )
        )
        apply_change_set(itinerary.id, absolute, user_id, commit=False)
        db.session.execute(
            update(TripTemplate)
            .where(TripTemplate.id == template.id)
            .values(clone_count=TripTemplate.clone_count + 1)
        )
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
    return itinerary

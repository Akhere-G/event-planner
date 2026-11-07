import re
import secrets
from datetime import date, datetime, timedelta

from sqlalchemy import func, or_, select, update

from ..exceptions import BadRequestError, TemplateNotFoundError
from ..extensions import db
from ..models import (
    Itinerary,
    ItineraryUser,
    TripTemplate,
    User,
    UserRole,
)
from ..schemas.trip_template_schema import (
    MAX_TEMPLATE_OPS,
    TemplateOpsSchema,
    load_template_data,
)
from .ai_services import to_trip_local, trip_local_to_utc
from .change_set_service import apply_change_set

TIME_FORMAT = "%H:%M"


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:100] or "trip"


def _unique_slug(title: str) -> str:
    while True:
        slug = f"{_slugify(title)}-{secrets.token_hex(3)}"
        exists = db.session.execute(
            select(TripTemplate.id).where(TripTemplate.slug == slug)
        ).first()
        if not exists:
            return slug


def _clip(value: str | None, length: int) -> str | None:
    return value[:length] if value else value


# ---------------------------------------------------------------------------
# Snapshot: trip -> relative ops
# ---------------------------------------------------------------------------


def build_snapshot_ops(itinerary: Itinerary) -> list[dict]:
    """Snapshot a trip's events, stays, shared packing items and wishlist items.

    Event times become a day offset from the trip start plus local wall-clock time
    in the trip's timezone. Expenses, members and flights are never included, and
    nothing that identifies a person is copied. Items outside the trip's dates are
    dropped.
    """
    duration = (itinerary.end_date - itinerary.start_date).days + 1
    tz = itinerary.timezone
    ops: list[dict] = []

    def offset(day: date) -> int:
        return (day - itinerary.start_date).days

    for event in sorted(itinerary.events, key=lambda e: e.start_at):
        start = to_trip_local(event.start_at, tz)
        end = to_trip_local(event.end_at, tz)
        if not 0 <= offset(start.date()) < duration or offset(end.date()) >= duration + 1:
            continue
        ops.append(
            {
                "op": "create",
                "entity": "event",
                "data": {
                    "name": event.name,
                    "description": event.description,
                    "address": event.address,
                    "latitude": event.latitude,
                    "longitude": event.longitude,
                    "category": event.category,
                    "day_offset": offset(start.date()),
                    "start_time": start.strftime(TIME_FORMAT),
                    "end_day_offset": offset(end.date()),
                    "end_time": end.strftime(TIME_FORMAT),
                },
            }
        )

    for stay in sorted(itinerary.accommodations, key=lambda a: a.start_date):
        if not (0 <= offset(stay.start_date) < duration) or offset(stay.end_date) > duration:
            continue
        ops.append(
            {
                "op": "create",
                "entity": "accommodation",
                "data": {
                    "name": stay.name,
                    "description": stay.description,
                    "address": stay.address,
                    "latitude": stay.latitude,
                    "longitude": stay.longitude,
                    "start_day_offset": offset(stay.start_date),
                    "end_day_offset": offset(stay.end_date),
                },
            }
        )

    for item in itinerary.packing_items:
        if item.is_shared:
            ops.append(
                {
                    "op": "create",
                    "entity": "packing_item",
                    "data": {"name": item.name, "category": item.category},
                }
            )

    for wishlist in itinerary.wishlists:
        for item in wishlist.items:
            ops.append(
                {
                    "op": "create",
                    "entity": "wishlist_item",
                    "data": {
                        "name": item.name,
                        "wishlist_name": wishlist.name,
                        "address": item.address,
                        "latitude": item.latitude,
                        "longitude": item.longitude,
                        "description": item.description,
                    },
                }
            )

    if not ops:
        raise BadRequestError("Add some events or places before publishing a template.")
    if len(ops) > MAX_TEMPLATE_OPS:
        raise BadRequestError(
            f"This trip is too large to publish (more than {MAX_TEMPLATE_OPS} items)."
        )

    # Round-trips the snapshot through the same schema used when it is read back.
    return normalise_ops(ops)


def normalise_ops(ops: list[dict]) -> list[dict]:
    loaded = TemplateOpsSchema().load({"ops": ops})["ops"]
    normalised = []
    for op in loaded:
        data = load_template_data(op["entity"], op["data"])
        data = {
            k: (v.strftime(TIME_FORMAT) if hasattr(v, "strftime") else v)
            for k, v in data.items()
        }
        normalised.append({"op": "create", "entity": op["entity"], "data": data})
    return normalised


# ---------------------------------------------------------------------------
# Publish / unpublish
# ---------------------------------------------------------------------------


def _load_itinerary(itinerary_id: int) -> Itinerary:
    itinerary = db.session.get(Itinerary, itinerary_id)
    if itinerary is None:
        raise TemplateNotFoundError("Itinerary not found.")
    return itinerary


def get_template_for_itinerary(itinerary_id: int) -> TripTemplate | None:
    return db.session.execute(
        select(TripTemplate).where(TripTemplate.itinerary_id == itinerary_id)
    ).scalar_one_or_none()


def publish_itinerary(
    itinerary_id: int, user_id: int, title: str | None, description: str | None
) -> TripTemplate:
    itinerary = _load_itinerary(itinerary_id)
    ops = build_snapshot_ops(itinerary)
    template = get_template_for_itinerary(itinerary_id)

    try:
        if template is None:
            template = TripTemplate(
                slug="",
                itinerary_id=itinerary_id,
                author_id=user_id,
                created_by_id=user_id,
            )
            template.title = title or itinerary.name
            template.slug = _unique_slug(template.title)
            db.session.add(template)
        elif title:
            template.title = title

        if description is not None:
            template.description = description
        elif template.description is None:
            template.description = itinerary.description

        template.destination = itinerary.destination
        template.latitude = itinerary.latitude
        template.longitude = itinerary.longitude
        template.timezone = itinerary.timezone
        template.duration_days = (itinerary.end_date - itinerary.start_date).days + 1
        template.ops = ops
        template.is_public = True
        template.updated_by_id = user_id
        if template.clone_count is None:
            template.clone_count = 0

        db.session.commit()
        return template
    except Exception:
        db.session.rollback()
        raise


def unpublish_itinerary(itinerary_id: int, user_id: int) -> TripTemplate:
    template = get_template_for_itinerary(itinerary_id)
    if template is None:
        raise TemplateNotFoundError("This trip has not been published.")
    template.is_public = False
    template.updated_by_id = user_id
    db.session.commit()
    return template


# ---------------------------------------------------------------------------
# Public reads
# ---------------------------------------------------------------------------


def list_templates(search: str | None, limit: int, offset: int):
    conditions = [TripTemplate.is_public.is_(True)]
    if search and search.strip():
        escaped = (
            search.strip().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        )
        pattern = f"%{escaped}%"
        conditions.append(
            or_(
                TripTemplate.destination.ilike(pattern, escape="\\"),
                TripTemplate.title.ilike(pattern, escape="\\"),
            )
        )

    total = db.session.execute(
        select(func.count()).select_from(TripTemplate).where(*conditions)
    ).scalar_one()
    rows = (
        db.session.execute(
            select(TripTemplate)
            .where(*conditions)
            .order_by(TripTemplate.clone_count.desc(), TripTemplate.id.desc())
            .limit(limit)
            .offset(offset)
        )
        .scalars()
        .all()
    )
    return rows, total


def get_public_template(slug: str) -> TripTemplate:
    template = db.session.execute(
        select(TripTemplate).where(
            TripTemplate.slug == slug, TripTemplate.is_public.is_(True)
        )
    ).scalar_one_or_none()
    if template is None:
        raise TemplateNotFoundError()
    return template


def _author_name(template: TripTemplate) -> str | None:
    if template.author_id is None:
        return None
    return db.session.execute(
        select(User.username).where(User.id == template.author_id)
    ).scalar_one_or_none()


def serialize_summary(template: TripTemplate) -> dict:
    """Public fields only. No emails, user ids, member lists or access codes."""
    counts = {"event": 0, "accommodation": 0, "packing_item": 0, "wishlist_item": 0}
    for op in template.ops or []:
        counts[op["entity"]] += 1
    return {
        "slug": template.slug,
        "title": template.title,
        "destination": template.destination,
        "latitude": template.latitude,
        "longitude": template.longitude,
        "duration_days": template.duration_days,
        "description": template.description,
        "author_name": _author_name(template),
        "clone_count": template.clone_count,
        "created_at": template.created_at,
        "event_count": counts["event"],
        "place_count": counts["accommodation"] + counts["wishlist_item"],
    }


def serialize_detail(template: TripTemplate) -> dict:
    days: dict[int, list[dict]] = {i: [] for i in range(template.duration_days)}
    accommodations, packing_items, wishlist_items = [], [], []

    for op in template.ops or []:
        data, entity = op["data"], op["entity"]
        if entity == "event":
            days.setdefault(data["day_offset"], []).append(data)
        elif entity == "accommodation":
            accommodations.append(data)
        elif entity == "packing_item":
            packing_items.append(data)
        else:
            wishlist_items.append(data)

    for events in days.values():
        events.sort(key=lambda e: e["start_time"])

    return {
        **serialize_summary(template),
        "timezone": template.timezone,
        "days": [
            {"day_offset": offset, "events": events}
            for offset, events in sorted(days.items())
        ],
        "accommodations": accommodations,
        "packing_items": packing_items,
        "wishlist_items": wishlist_items,
    }


def serialize_publish_status(template: TripTemplate | None) -> dict:
    if template is None:
        return {"is_published": False, "slug": None}
    return {
        "is_published": template.is_public,
        "slug": template.slug,
        "title": template.title,
        "clone_count": template.clone_count,
    }


# ---------------------------------------------------------------------------
# Clone
# ---------------------------------------------------------------------------


def materialise_ops(ops: list[dict], start_date: date, timezone_name: str | None):
    """Shift relative ops onto ``start_date`` and convert local times to UTC."""

    def day(offset: int) -> date:
        return start_date + timedelta(days=offset)

    def local_to_utc(offset: int, time_text: str) -> str:
        wall_clock = datetime.combine(
            day(offset), datetime.strptime(time_text, TIME_FORMAT).time()
        )
        return trip_local_to_utc(wall_clock, timezone_name).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )

    absolute = []
    for op in ops:
        data = dict(op["data"])
        if op["entity"] == "event":
            data["start_at"] = local_to_utc(data.pop("day_offset"), data.pop("start_time"))
            data["end_at"] = local_to_utc(data.pop("end_day_offset"), data.pop("end_time"))
        elif op["entity"] == "accommodation":
            data["start_date"] = day(data.pop("start_day_offset")).isoformat()
            data["end_date"] = day(data.pop("end_day_offset")).isoformat()
        absolute.append({"op": "create", "entity": op["entity"], "data": data})
    return absolute


def clone_template(slug: str, user_id: int, start_date: date) -> Itinerary:
    template = get_public_template(slug)
    absolute = materialise_ops(template.ops or [], start_date, template.timezone)

    try:
        itinerary = Itinerary(
            name=template.title,
            destination=template.destination,
            latitude=template.latitude,
            longitude=template.longitude,
            description=_clip(template.description, 255),
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
        if absolute:
            apply_change_set(itinerary.id, absolute, user_id, commit=False)
        db.session.execute(
            update(TripTemplate)
            .where(TripTemplate.id == template.id)
            .values(clone_count=TripTemplate.clone_count + 1)
        )
        db.session.commit()
        return itinerary
    except Exception:
        db.session.rollback()
        raise

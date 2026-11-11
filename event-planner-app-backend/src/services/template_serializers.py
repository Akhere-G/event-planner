from collections import defaultdict
from collections.abc import Mapping
from typing import Any

from sqlalchemy.engine import Row

from ..models import TripTemplate


def _count_entities(template: TripTemplate) -> dict[str, int]:
    counts: dict[str, int] = defaultdict(int)
    for op in template.ops:
        counts[op["entity"]] += 1
    return counts


def serialize_summary(
    template: TripTemplate, author_name: str | None
) -> dict[str, Any]:
    """Public fields only: never an email, user id, member list or access code."""
    counts = _count_entities(template)
    return {
        "slug": template.slug,
        "title": template.title,
        "description": template.description,
        "destination": template.destination,
        "region": template.region,
        "latitude": template.latitude,
        "longitude": template.longitude,
        "duration_days": template.duration_days,
        "cover_image": template.cover_image,
        "author_name": author_name,
        "clone_count": template.clone_count,
        "created_at": template.created_at,
        "event_count": counts["event"],
        "place_count": counts["accommodation"] + counts["wishlist_item"],
    }


def serialize_detail(template: TripTemplate, author_name: str | None) -> dict[str, Any]:
    events_by_day: dict[int, list[dict[str, Any]]] = {
        offset: [] for offset in range(template.duration_days)
    }
    accommodations, packing_items, wishlist_items = [], [], []

    for op in template.ops:
        data = op["data"]
        if op["entity"] == "event":
            events_by_day.setdefault(data["day_offset"], []).append(data)
        elif op["entity"] == "accommodation":
            accommodations.append(data)
        elif op["entity"] == "packing_item":
            packing_items.append(data)
        else:
            wishlist_items.append(data)

    days = []
    for offset, events in sorted(events_by_day.items()):
        days.append(
            {
                "day_offset": offset,
                "events": sorted(events, key=lambda event: event["start_time"]),
            }
        )

    return {
        **serialize_summary(template, author_name),
        "timezone": template.timezone,
        "days": days,
        "accommodations": accommodations,
        "packing_items": packing_items,
        "wishlist_items": wishlist_items,
    }


def serialize_pin(row: Row[Any]) -> Mapping[str, Any]:
    return dict(row._mapping)


def serialize_publish_status(template: TripTemplate | None) -> dict[str, Any]:
    if template is None:
        return {"is_published": False}
    return {
        "is_published": template.is_public,
        "slug": template.slug,
        "title": template.title,
        "region": template.region,
        "clone_count": template.clone_count,
    }

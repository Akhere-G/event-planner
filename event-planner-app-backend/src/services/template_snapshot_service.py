from collections.abc import Callable
from dataclasses import dataclass
from datetime import date
from typing import Any

from ..exceptions import BadRequestError
from ..models import Itinerary
from ..schemas.trip_template_schema import (
    MAX_TEMPLATE_OPS,
    TIME_FORMAT,
    normalise_template_ops,
)
from ..utils.trip_time import to_trip_local

EVENT_DESCRIPTION_LENGTH = 255


@dataclass(frozen=True)
class TripSpan:
    start: date
    days: int

    @classmethod
    def of(cls, itinerary: Itinerary) -> "TripSpan":
        return cls(
            itinerary.start_date, (itinerary.end_date - itinerary.start_date).days + 1
        )

    def offset(self, day: date) -> int:
        return (day - self.start).days

    def starts_within(self, day: date) -> bool:
        return 0 <= self.offset(day) < self.days

    def ends_within(self, day: date) -> bool:
        return self.offset(day) <= self.days


def _event_ops(itinerary: Itinerary, span: TripSpan) -> list[dict[str, Any]]:
    ops = []
    for event in sorted(itinerary.events, key=lambda e: e.start_at):
        start = to_trip_local(event.start_at, itinerary.timezone)
        end = to_trip_local(event.end_at, itinerary.timezone)
        if not span.starts_within(start.date()) or not span.ends_within(end.date()):
            continue
        description = event.description
        ops.append(
            {
                "op": "create",
                "entity": "event",
                "data": {
                    "name": event.name,
                    "description": description[:EVENT_DESCRIPTION_LENGTH]
                    if description
                    else description,
                    "address": event.address,
                    "latitude": event.latitude,
                    "longitude": event.longitude,
                    "category": event.category,
                    "day_offset": span.offset(start.date()),
                    "start_time": start.strftime(TIME_FORMAT),
                    "end_day_offset": span.offset(end.date()),
                    "end_time": end.strftime(TIME_FORMAT),
                },
            }
        )
    return ops


def _accommodation_ops(itinerary: Itinerary, span: TripSpan) -> list[dict[str, Any]]:
    ops = []
    for accommodation in sorted(itinerary.accommodations, key=lambda a: a.start_date):
        if not span.starts_within(accommodation.start_date) or not span.ends_within(
            accommodation.end_date
        ):
            continue
        ops.append(
            {
                "op": "create",
                "entity": "accommodation",
                "data": {
                    "name": accommodation.name,
                    "description": accommodation.description,
                    "address": accommodation.address,
                    "latitude": accommodation.latitude,
                    "longitude": accommodation.longitude,
                    "start_day_offset": span.offset(accommodation.start_date),
                    "end_day_offset": span.offset(accommodation.end_date),
                },
            }
        )
    return ops


def _packing_item_ops(itinerary: Itinerary, span: TripSpan) -> list[dict[str, Any]]:
    ops = []
    for item in itinerary.packing_items:
        if item.is_shared:
            ops.append(
                {
                    "op": "create",
                    "entity": "packing_item",
                    "data": {"name": item.name, "category": item.category},
                }
            )
    return ops


def _wishlist_item_ops(itinerary: Itinerary, span: TripSpan) -> list[dict[str, Any]]:
    ops = []
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
    return ops


_SNAPSHOT_BUILDERS: tuple[
    Callable[[Itinerary, TripSpan], list[dict[str, Any]]], ...
] = (
    _event_ops,
    _accommodation_ops,
    _packing_item_ops,
    _wishlist_item_ops,
)


def build_snapshot_ops(itinerary: Itinerary) -> list[dict[str, Any]]:
    """Snapshot a trip as relative create ops.

    Events become a day offset from the trip start plus wall-clock time in the
    trip's timezone. Expenses, members, flights and personal packing items are never
    included, and events or stays outside the trip's dates are dropped.
    """
    span = TripSpan.of(itinerary)
    ops: list[dict[str, Any]] = []
    for build in _SNAPSHOT_BUILDERS:
        ops.extend(build(itinerary, span))

    if not ops:
        raise BadRequestError("Add some events or places before publishing a template.")
    if len(ops) > MAX_TEMPLATE_OPS:
        raise BadRequestError(
            f"This trip is too large to publish (more than {MAX_TEMPLATE_OPS} items)."
        )
    return normalise_template_ops(ops)

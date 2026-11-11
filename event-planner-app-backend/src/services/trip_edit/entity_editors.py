"""What the model may see and change for each kind of item on a trip."""

from datetime import datetime
from typing import Any

from ...models import Itinerary
from ...utils.trip_time import to_trip_local, trip_local_to_utc
from ..flight_context import overlaps_any
from ..trip_generation_service import geocode
from .editor_base import EntityEditor

_MINUTES = "%Y-%m-%dT%H:%M"


def _parse_local(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return None


class EventEditor(EntityEditor):
    entity = "event"
    title = "EVENTS"
    fields = ("name", "description", "start_at", "end_at", "category")
    create_only_fields = ("address",)
    hint = (
        "name, description, category (max 10 characters), start_at, end_at; "
        "address (full street address, only when creating)"
    )

    def describe_items(self, itinerary: Itinerary) -> dict[int, str]:
        descriptions = {}
        for event in sorted(itinerary.events, key=lambda event: event.start_at):
            start = to_trip_local(event.start_at, self.timezone)
            end = to_trip_local(event.end_at, self.timezone)
            descriptions[event.id] = (
                f"{event.name} | {start:{_MINUTES}} to {end:{_MINUTES}} | "
                f"{event.address} | {event.category}"
            )
        return descriptions

    def normalise(
        self, kind: str, item_id: int | None, data: dict[str, Any]
    ) -> dict[str, Any] | None:
        if kind == "create" or "start_at" in data or "end_at" in data:
            data = self._with_utc_times(data)
            if data is None:
                return None
        if kind == "create":
            return self._with_place(data)
        return data

    def _with_utc_times(self, data: dict[str, Any]) -> dict[str, Any] | None:
        start = _parse_local(data.get("start_at"))
        end = _parse_local(data.get("end_at"))
        if start is None or end is None or end <= start:
            return None
        if overlaps_any(self.flights, start, end):
            return None
        return {
            **data,
            "start_at": trip_local_to_utc(start, self.timezone).isoformat(),
            "end_at": trip_local_to_utc(end, self.timezone).isoformat(),
        }

    def _with_place(self, data: dict[str, Any]) -> dict[str, Any] | None:
        place = geocode(self.itinerary_id, data["name"], data.get("address"))
        if place is None:
            return None
        return {**data, **place}


class AccommodationEditor(EntityEditor):
    entity = "accommodation"
    title = "ACCOMMODATIONS"
    fields = ("name", "address", "description", "start_date", "end_date")
    hint = "name, address, description, start_date, end_date (YYYY-MM-DD)"

    def describe_items(self, itinerary: Itinerary) -> dict[int, str]:
        descriptions = {}
        for stay in itinerary.accommodations:
            descriptions[stay.id] = (
                f"{stay.name} | {stay.start_date} to {stay.end_date} | {stay.address}"
            )
        return descriptions


class PackingItemEditor(EntityEditor):
    entity = "packing_item"
    title = "PACKING ITEMS"
    fields = ("name", "category", "is_shared", "is_checked")
    hint = "name, category, is_shared (true or false), is_checked (true or false)"

    def describe_items(self, itinerary: Itinerary) -> dict[int, str]:
        descriptions = {}
        for item in itinerary.packing_items:
            if item.is_shared or item.owner_id == self.user_id:
                kind = "shared" if item.is_shared else "personal"
                descriptions[item.id] = f"{item.name} | {item.category} | {kind}"
        return descriptions


class WishlistItemEditor(EntityEditor):
    entity = "wishlist_item"
    title = "WISHLIST ITEMS"
    fields = ("name", "description")
    create_only_fields = ("address", "wishlist_name")
    hint = (
        "name, description; address and wishlist_name (the list to add it to) "
        "only when creating"
    )

    def describe_items(self, itinerary: Itinerary) -> dict[int, str]:
        descriptions = {}
        for wishlist in itinerary.wishlists:
            for item in wishlist.items:
                descriptions[item.id] = f"{item.name} | list: {wishlist.name}"
        return descriptions

    def normalise(
        self, kind: str, item_id: int | None, data: dict[str, Any]
    ) -> dict[str, Any] | None:
        if kind == "create" and data.get("address"):
            place = geocode(self.itinerary_id, data["name"], data["address"])
            return {**data, **(place or {})}
        return data

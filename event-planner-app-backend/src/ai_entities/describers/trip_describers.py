from ...models import Itinerary
from ...utils.trip_time import to_trip_local
from ..context import Requester
from .base import EntityDescriber, EntityDescription

_MINUTES = "%Y-%m-%dT%H:%M"


class TripDescriber(EntityDescriber):
    entity = "trip"
    title = "TRIP"

    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        budget = itinerary.budget_amount_gbp
        return {
            itinerary.id: EntityDescription(
                id=itinerary.id,
                label="Trip dates and budget",
                summary=(
                    f"start_date {itinerary.start_date} | "
                    f"end_date {itinerary.end_date} | "
                    f"budget_amount_gbp {'none' if budget is None else budget}"
                ),
                values={
                    "start_date": itinerary.start_date.isoformat(),
                    "end_date": itinerary.end_date.isoformat(),
                },
            )
        }


class EventDescriber(EntityDescriber):
    entity = "event"
    title = "EVENTS"

    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        descriptions = {}
        for event in sorted(itinerary.events, key=lambda event: event.start_at):
            start = to_trip_local(event.start_at, itinerary.timezone)
            end = to_trip_local(event.end_at, itinerary.timezone)
            descriptions[event.id] = EntityDescription(
                id=event.id,
                label=event.name,
                summary=(
                    f"{start:{_MINUTES}} to {end:{_MINUTES}} | "
                    f"{event.address} | {event.category}"
                ),
                values={
                    "address": event.address,
                    "latitude": event.latitude,
                    "longitude": event.longitude,
                },
            )
        return descriptions


class AccommodationDescriber(EntityDescriber):
    entity = "accommodation"
    title = "ACCOMMODATIONS"

    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        descriptions = {}
        for accommodation in itinerary.accommodations:
            descriptions[accommodation.id] = EntityDescription(
                id=accommodation.id,
                label=accommodation.name,
                summary=(
                    f"{accommodation.start_date} to {accommodation.end_date} | "
                    f"{accommodation.address}"
                ),
                values={
                    "start_date": accommodation.start_date.isoformat(),
                    "end_date": accommodation.end_date.isoformat(),
                    "address": accommodation.address,
                    "latitude": accommodation.latitude,
                    "longitude": accommodation.longitude,
                },
            )
        return descriptions


class PackingItemDescriber(EntityDescriber):
    entity = "packing_item"
    title = "PACKING ITEMS"

    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        descriptions = {}
        for item in itinerary.packing_items:
            if not item.is_shared and item.owner_id != requester.user_id:
                continue
            sharing = "shared" if item.is_shared else "personal"
            descriptions[item.id] = EntityDescription(
                id=item.id,
                label=item.name,
                summary=f"{item.category} | {sharing}",
            )
        return descriptions


class WishlistDescriber(EntityDescriber):
    entity = "wishlist"
    title = "WISHLISTS"

    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        descriptions = {}
        for wishlist in itinerary.wishlists:
            descriptions[wishlist.id] = EntityDescription(
                id=wishlist.id,
                label=wishlist.name,
                summary=f"{len(wishlist.items)} items",
                values={"name": wishlist.name},
            )
        return descriptions


class WishlistItemDescriber(EntityDescriber):
    entity = "wishlist_item"
    title = "WISHLIST ITEMS"

    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        descriptions = {}
        for wishlist in itinerary.wishlists:
            for item in wishlist.items:
                descriptions[item.id] = EntityDescription(
                    id=item.id,
                    label=item.name,
                    summary=f"list: {wishlist.name}",
                    values={
                        "address": item.address,
                        "latitude": item.latitude,
                        "longitude": item.longitude,
                    },
                )
        return descriptions

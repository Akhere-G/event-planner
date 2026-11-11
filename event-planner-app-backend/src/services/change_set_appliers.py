from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, ClassVar

from marshmallow import Schema

from ..schemas.accommodation_schema import AccommodationSchema
from ..schemas.event_schema import EventSchema
from ..schemas.packing_item_schema import PackingItemSchema
from ..schemas.wishlist_schema import WishlistItemSchema
from . import (
    accommodation_service,
    events_service,
    packing_item_service,
    wishlist_service,
)

DEFAULT_WISHLIST_NAME = "AI ideas"


@dataclass
class PreparedOp:
    """A change op whose data has been validated and is ready to apply."""

    kind: str  # create | update | delete
    entity_id: int | None
    data: dict[str, Any] = field(default_factory=dict)
    context: dict[str, Any] = field(default_factory=dict)


class ChangeSetApplier(ABC):
    """Validates and applies create/update/delete ops for one entity type.

    Subclasses only stage their changes (flush, never commit) so the caller can
    apply a whole change set in a single transaction.
    """

    entity: ClassVar[str]
    schema_class: ClassVar[type[Schema]]
    create_defaults: ClassVar[dict[str, Any]] = {}

    def __init__(self, itinerary_id: int, user_id: int | None):
        self.itinerary_id = itinerary_id
        self.user_id = user_id

    def prepare(self, op: dict) -> PreparedOp:
        """Validate an op's data with the entity's existing schema."""
        kind = op["op"]
        if kind == "delete":
            return PreparedOp(kind=kind, entity_id=op.get("id"))

        data, context = self.extract_context(dict(op["data"]))
        if kind == "create":
            data = {**self.create_defaults, **data}

        schema = self.schema_class(partial=(kind == "update"))
        return PreparedOp(
            kind=kind,
            entity_id=op.get("id"),
            data=schema.load(data),
            context=context,
        )

    def extract_context(self, data: dict) -> tuple[dict, dict]:
        """Split non-schema fields out of the op data. Most entities have none."""
        return data, {}

    def preview(self, op: PreparedOp) -> dict[str, Any]:
        """The op's data as the API shows it, without saving anything."""
        if op.kind == "delete":
            return {}
        return self.schema_class(partial=op.kind == "update").dump(op.data)

    def apply(self, op: PreparedOp) -> None:
        if op.kind == "create":
            self.create(op.data, op.context)
        elif op.kind == "update":
            self.update(op.entity_id, op.data)
        else:
            self.delete(op.entity_id)

    @abstractmethod
    def create(self, data: dict, context: dict) -> None: ...

    @abstractmethod
    def update(self, entity_id: int, data: dict) -> None: ...

    @abstractmethod
    def delete(self, entity_id: int) -> None: ...


class EventChangeSetApplier(ChangeSetApplier):
    entity = "event"
    schema_class = EventSchema

    def create(self, data, context):
        events_service.stage_create_event(
            self.itinerary_id,
            {**data, "created_by_id": self.user_id, "updated_by_id": self.user_id},
        )

    def update(self, entity_id, data):
        events_service.stage_update_event(
            self.itinerary_id, entity_id, data, self.user_id
        )

    def delete(self, entity_id):
        events_service.stage_delete_event(self.itinerary_id, entity_id)


class AccommodationChangeSetApplier(ChangeSetApplier):
    entity = "accommodation"
    schema_class = AccommodationSchema

    def create(self, data, context):
        accommodation_service.stage_create_accommodation(
            self.user_id, self.itinerary_id, data
        )

    def update(self, entity_id, data):
        accommodation_service.stage_update_accommodation(
            self.itinerary_id, entity_id, self.user_id, data
        )

    def delete(self, entity_id):
        accommodation_service.stage_delete_accommodation(self.itinerary_id, entity_id)


class PackingItemChangeSetApplier(ChangeSetApplier):
    entity = "packing_item"
    schema_class = PackingItemSchema
    create_defaults = {"is_shared": True, "category": "General"}

    def create(self, data, context):
        packing_item_service.stage_create_packing_item(
            self.user_id, self.itinerary_id, data
        )

    def update(self, entity_id, data):
        packing_item_service.stage_update_packing_item(
            self.user_id, self.itinerary_id, entity_id, data
        )

    def delete(self, entity_id):
        packing_item_service.stage_delete_packing_item(
            self.user_id, self.itinerary_id, entity_id
        )


class WishlistItemChangeSetApplier(ChangeSetApplier):
    entity = "wishlist_item"
    schema_class = WishlistItemSchema

    def extract_context(self, data):
        name = data.pop("wishlist_name", None) or data.pop("wishlistName", None)
        return data, {"wishlist_name": name or DEFAULT_WISHLIST_NAME}

    def preview(self, op: PreparedOp) -> dict[str, Any]:
        data = super().preview(op)
        if op.kind == "create":
            data["wishlist_name"] = op.context["wishlist_name"]
        return data

    def create(self, data, context):
        wishlist_name = context.get("wishlist_name", DEFAULT_WISHLIST_NAME)
        wishlist = wishlist_service.get_wishlist_by_name(
            self.itinerary_id, wishlist_name
        ) or wishlist_service.stage_create_wishlist(
            self.user_id, self.itinerary_id, wishlist_name
        )
        wishlist_service.stage_create_wishlist_item(
            self.itinerary_id, wishlist.id, data, self.user_id
        )

    def update(self, entity_id, data):
        wishlist_service.stage_update_wishlist_item(
            self.itinerary_id, entity_id, data, self.user_id
        )

    def delete(self, entity_id):
        wishlist_service.stage_delete_wishlist_item(self.itinerary_id, entity_id)


_APPLIER_CLASSES: dict[str, type[ChangeSetApplier]] = {
    applier.entity: applier
    for applier in (
        EventChangeSetApplier,
        AccommodationChangeSetApplier,
        PackingItemChangeSetApplier,
        WishlistItemChangeSetApplier,
    )
}


class ChangeSetApplierFactory:
    @staticmethod
    def create(
        entity: str, itinerary_id: int, user_id: int | None
    ) -> ChangeSetApplier:
        try:
            applier_class = _APPLIER_CLASSES[entity]
        except KeyError:
            raise ValueError(f"Unsupported change set entity: {entity}") from None
        return applier_class(itinerary_id, user_id)

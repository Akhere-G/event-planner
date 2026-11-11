from abc import ABC
from collections.abc import Mapping
from typing import ClassVar

from ..context import Requester, ValidationContext
from ..describers.base import EntityDescription
from ..json_types import JsonObject, JsonValue
from ..parsing import as_object, pick


class EntityValidator(ABC):
    """Cleans and checks AI-generated data for one entity type.

    Both entry points return the data in the form the API takes (UTC times, resolved
    places), or None when the AI's proposal cannot be used. Value types and lengths
    are left to the entity's schema, which the change set applier checks.
    """

    entity: ClassVar[str]
    fields: ClassVar[tuple[str, ...]]
    create_only_fields: ClassVar[tuple[str, ...]] = ()
    create_required: ClassVar[tuple[str, ...]] = ("name",)
    kinds: ClassVar[tuple[str, ...]] = ("create", "update", "delete")
    uses_members: ClassVar[bool] = False
    prompt_hint: ClassVar[str]
    prompt_notes: ClassVar[str] = ""

    def __init__(
        self,
        context: ValidationContext,
        existing: Mapping[int, EntityDescription] | None = None,
    ) -> None:
        self.context = context
        self.existing = existing or {}

    @classmethod
    def is_available(cls, requester: Requester) -> bool:
        return True

    def knows(self, entity_id: int) -> bool:
        return entity_id in self.existing

    def validate_create(self, raw: JsonValue) -> JsonObject | None:
        picked = self._picked(raw, self.fields + self.create_only_fields)
        if picked is None:
            return None
        data = self.defaults(self.tidy(picked))
        if not set(self.create_required) <= data.keys():
            return None
        return self.check_create(data)

    def validate_edit(self, entity_id: int, raw: JsonValue) -> JsonObject | None:
        if not self.knows(entity_id):
            return None
        picked = self._picked(raw, self.fields)
        data = self.tidy(picked) if picked else None
        if not data:
            return None
        return self.check_edit(self.existing[entity_id], data)

    @staticmethod
    def _picked(raw: JsonValue, fields: tuple[str, ...]) -> JsonObject | None:
        data = as_object(raw)
        return None if data is None else pick(data, fields)

    def tidy(self, data: JsonObject) -> JsonObject:
        """Fix a model's usual slips before anything is checked."""
        return data

    def defaults(self, data: JsonObject) -> JsonObject:
        """Fill what a new entity may leave out, before the required fields count."""
        return data

    def check_create(self, data: JsonObject) -> JsonObject | None:
        return data

    def check_edit(
        self, current: EntityDescription, data: JsonObject
    ) -> JsonObject | None:
        return data

    def _located(
        self, data: JsonObject, name: str, place_type: str = "establishment"
    ) -> JsonObject | None:
        address = data.get("address")
        place = self.context.places.resolve(
            name, address if isinstance(address, str) else None, place_type
        )
        return None if place is None else {**data, **place.as_data()}

"""What every editor shares: the context it is built from and the editor contract.

An editor reads everything it needs from the trip when it is built, so it can be used
after the database connection has been released.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, ClassVar

from ...models import Itinerary, UserRole
from ..flight_context import FlightWindow


@dataclass(frozen=True)
class EditContext:
    itinerary: Itinerary
    user_id: int | None
    role: str | None
    flights: list[FlightWindow]
    members: dict[int, str]

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN.value


class EntityEditor(ABC):
    entity: ClassVar[str]
    title: ClassVar[str]
    fields: ClassVar[tuple[str, ...]]
    create_only_fields: ClassVar[tuple[str, ...]] = ()
    kinds: ClassVar[tuple[str, ...]] = ("create", "update", "delete")
    create_required: ClassVar[tuple[str, ...]] = ("name",)
    hint: ClassVar[str]

    def __init__(self, context: EditContext) -> None:
        self.itinerary_id = context.itinerary.id
        self.timezone = context.itinerary.timezone
        self.flights = context.flights
        self.user_id = context.user_id
        self.is_admin = context.is_admin
        self.members = context.members
        self.descriptions = self.describe_items(context.itinerary)

    @classmethod
    def is_available(cls, context: EditContext) -> bool:
        """Whether this user may be offered the chance to edit this kind of item."""
        return True

    @abstractmethod
    def describe_items(self, itinerary: Itinerary) -> dict[int, str]:
        """Item id -> one prompt line describing it."""

    def allowed_fields(self, kind: str) -> tuple[str, ...]:
        if kind == "create":
            return self.fields + self.create_only_fields
        return self.fields

    def ids(self) -> frozenset[int]:
        return frozenset(self.descriptions)

    def lines(self) -> list[str]:
        lines = []
        for item_id, description in self.descriptions.items():
            lines.append(f"- id={item_id} | {description}")
        return lines

    def normalise(
        self, kind: str, item_id: int | None, data: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Make the op's data ready to validate, or None when it cannot be used."""
        return data

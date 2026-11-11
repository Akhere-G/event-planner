from abc import ABC, abstractmethod
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import ClassVar

from ...models import Itinerary
from ..context import Requester
from ..json_types import JsonObject


@dataclass(frozen=True)
class EntityDescription:
    id: int
    label: str
    summary: str
    values: JsonObject = field(default_factory=dict)

    @property
    def line(self) -> str:
        parts = [f"- id={self.id}", self.label]
        if self.summary:
            parts.append(self.summary)
        return " | ".join(parts)


class EntityDescriber(ABC):
    """Describes the saved entities of one type, as plain data, for a prompt."""

    entity: ClassVar[str]
    title: ClassVar[str]

    @abstractmethod
    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        """The entities the requester can see, by id."""


def prompt_lines(descriptions: Mapping[int, EntityDescription]) -> list[str]:
    lines = []
    for description in descriptions.values():
        lines.append(description.line)
    return lines

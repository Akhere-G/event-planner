from abc import ABC, abstractmethod
from typing import Any, ClassVar, Self

from marshmallow import Schema

from ..client import ClientFactory


class CalendarJob(ABC):
    """One unit of background calendar sync: a dataclass subclass and a registry entry.

    A job travels as a JSON payload so it can run in another process.
    """

    job_type: ClassVar[str]
    payload_schema: ClassVar[type[Schema]]

    @abstractmethod
    def run(self, client_for: ClientFactory) -> None: ...

    def to_payload(self) -> dict[str, Any]:
        return self.payload_schema().dump(self)

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> Self:
        return cls(**cls.payload_schema().load(payload))

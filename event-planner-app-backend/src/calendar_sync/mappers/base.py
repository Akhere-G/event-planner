from abc import ABC, abstractmethod
from typing import Any, ClassVar

from sqlalchemy import select

from ...extensions import db
from ...models import Itinerary
from ..client import GoogleEvent


class EntitySyncMapper(ABC):
    """Translates one kind of trip row to and from a Google Calendar event.

    Add a mapper and register it in `mappers/__init__.py` to sync another entity.
    """

    entity: ClassVar[str]
    model: ClassVar[type]
    creatable_from_google: ClassVar[bool] = False

    def load(self, entity_id: int) -> Any | None:
        return db.session.get(self.model, entity_id)

    def list_for_trip(self, itinerary_id: int) -> list[Any]:
        stmt = select(self.model).where(self.model.itinerary_id == itinerary_id)
        return list(db.session.execute(stmt).scalars())

    def delete(self, obj: Any) -> None:
        db.session.delete(obj)

    @abstractmethod
    def to_google(self, obj: Any) -> GoogleEvent: ...

    @abstractmethod
    def apply_google(
        self, obj: Any, google_event: GoogleEvent, itinerary: Itinerary
    ) -> None:
        """Copies the fields Google may edit onto the row."""

    def create_from_google(
        self, itinerary: Itinerary, google_event: GoogleEvent
    ) -> Any:
        raise NotImplementedError(f"{self.entity} cannot be created from Google")

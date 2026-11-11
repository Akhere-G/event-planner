"""What the AI may edit in one chat request: each entity's saved data and validator."""

from collections.abc import Iterable, Mapping
from dataclasses import dataclass

from ...ai_entities.context import Requester, ValidationContext
from ...ai_entities.describers.base import EntityDescription, prompt_lines
from ...ai_entities.describers.factory import EntityDescriberFactory
from ...ai_entities.places import Place, PlaceResolver
from ...ai_entities.validators.base import EntityValidator
from ...ai_entities.validators.factory import EntityValidatorFactory
from ...models import Itinerary
from ..flight_context import FlightWindow


@dataclass(frozen=True)
class EditableEntity:
    title: str
    descriptions: Mapping[int, EntityDescription]
    validator: EntityValidator

    @property
    def lines(self) -> list[str]:
        return prompt_lines(self.descriptions)


def _saved_places(descriptions: Iterable[EntityDescription]) -> list[Place]:
    places = []
    for description in descriptions:
        place = Place.from_values(description.values)
        if place is not None:
            places.append(place)
    return places


def build_editable_entities(
    itinerary: Itinerary, requester: Requester, flights: list[FlightWindow]
) -> dict[str, EditableEntity]:
    titles: dict[str, str] = {}
    described: dict[str, Mapping[int, EntityDescription]] = {}
    saved: list[EntityDescription] = []
    for validator_class in EntityValidatorFactory.available_for(requester):
        describer = EntityDescriberFactory.create(validator_class.entity)
        titles[validator_class.entity] = describer.title
        described[validator_class.entity] = describer.describe(itinerary, requester)
        saved.extend(described[validator_class.entity].values())

    context = ValidationContext(
        itinerary.timezone,
        requester,
        flights,
        PlaceResolver(_saved_places(saved)),
    )
    entities = {}
    for entity, descriptions in described.items():
        validator = EntityValidatorFactory.create(entity, context, descriptions)
        entities[entity] = EditableEntity(titles[entity], descriptions, validator)
    return entities

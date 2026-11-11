from .base import EntityDescriber
from .money_describers import ExpenseDescriber, SettlementDescriber
from .trip_describers import (
    AccommodationDescriber,
    EventDescriber,
    PackingItemDescriber,
    TripDescriber,
    WishlistDescriber,
    WishlistItemDescriber,
)

_DESCRIBER_CLASSES: dict[str, type[EntityDescriber]] = {}
for _describer in (
    TripDescriber,
    EventDescriber,
    AccommodationDescriber,
    PackingItemDescriber,
    WishlistDescriber,
    WishlistItemDescriber,
    ExpenseDescriber,
    SettlementDescriber,
):
    _DESCRIBER_CLASSES[_describer.entity] = _describer


class EntityDescriberFactory:
    @staticmethod
    def create(entity: str) -> EntityDescriber:
        try:
            return _DESCRIBER_CLASSES[entity]()
        except KeyError:
            raise ValueError(f"Unsupported entity to describe: {entity}") from None

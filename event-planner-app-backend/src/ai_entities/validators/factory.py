from collections.abc import Mapping

from ..context import Requester, ValidationContext
from ..describers.base import EntityDescription
from .accommodation import AccommodationValidator
from .base import EntityValidator
from .event import EventValidator
from .money import ExpenseValidator, SettlementValidator
from .packing_item import PackingItemValidator
from .trip import TripValidator
from .wishlist import WishlistItemValidator, WishlistValidator

_VALIDATOR_CLASSES: dict[str, type[EntityValidator]] = {}
for _validator in (
    TripValidator,
    EventValidator,
    AccommodationValidator,
    PackingItemValidator,
    WishlistValidator,
    WishlistItemValidator,
    ExpenseValidator,
    SettlementValidator,
):
    _VALIDATOR_CLASSES[_validator.entity] = _validator


class EntityValidatorFactory:
    @staticmethod
    def create(
        entity: str,
        context: ValidationContext,
        existing: Mapping[int, EntityDescription] | None = None,
    ) -> EntityValidator:
        try:
            return _VALIDATOR_CLASSES[entity](context, existing)
        except KeyError:
            raise ValueError(f"Unsupported entity to validate: {entity}") from None

    @staticmethod
    def available_for(requester: Requester) -> list[type[EntityValidator]]:
        available = []
        for validator in _VALIDATOR_CLASSES.values():
            if validator.is_available(requester):
                available.append(validator)
        return available

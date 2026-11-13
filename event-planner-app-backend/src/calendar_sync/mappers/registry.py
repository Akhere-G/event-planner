from .base import EntitySyncMapper

_MAPPERS: dict[str, EntitySyncMapper] = {}


def register_mapper(mapper: EntitySyncMapper) -> None:
    _MAPPERS[mapper.entity] = mapper


def has_mapper(entity: str) -> bool:
    return entity in _MAPPERS


def get_mapper(entity: str) -> EntitySyncMapper:
    return _MAPPERS[entity]


def all_mappers() -> list[EntitySyncMapper]:
    return list(_MAPPERS.values())


def creation_mapper() -> EntitySyncMapper:
    """The mapper that turns a brand-new Google event into a trip row."""
    return next(m for m in _MAPPERS.values() if m.creatable_from_google)

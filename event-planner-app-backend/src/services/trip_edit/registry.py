from .editor_base import EditContext, EntityEditor
from .trip_editor import TripEditor
from .entity_editors import (
    AccommodationEditor,
    EventEditor,
    PackingItemEditor,
    WishlistItemEditor,
)

EDITORS: dict[str, type[EntityEditor]] = {
    TripEditor.entity: TripEditor,
    EventEditor.entity: EventEditor,
    AccommodationEditor.entity: AccommodationEditor,
    PackingItemEditor.entity: PackingItemEditor,
    WishlistItemEditor.entity: WishlistItemEditor,
}


def build_editors(context: EditContext) -> dict[str, EntityEditor]:
    """The editors this user may use, keyed by entity."""
    editors = {}
    for entity, editor_class in EDITORS.items():
        if editor_class.is_available(context):
            editors[entity] = editor_class(context)
    return editors

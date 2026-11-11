from .editor_base import EditContext, EntityEditor
from .money_editors import ExpenseEditor, SettlementEditor
from .trip_editor import TripEditor
from .wishlist_editor import WishlistEditor
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
    WishlistEditor.entity: WishlistEditor,
    WishlistItemEditor.entity: WishlistItemEditor,
    ExpenseEditor.entity: ExpenseEditor,
    SettlementEditor.entity: SettlementEditor,
}


def build_editors(context: EditContext) -> dict[str, EntityEditor]:
    editors = {}
    for entity, editor_class in EDITORS.items():
        if editor_class.is_available(context):
            editors[entity] = editor_class(context)
    return editors

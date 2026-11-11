from unittest.mock import patch

from src.services.trip_edit.editor_base import EntityEditor
from src.services.trip_edit.registry import EDITORS, build_editors
from tests.factories import edit_context


class HiddenEditor(EntityEditor):
    entity = "hidden"
    title = "HIDDEN"
    fields = ("name",)
    hint = "name"

    @classmethod
    def is_available(cls, context):
        return False

    def describe_entities(self, itinerary):
        return {}


def test_every_available_editor_is_built_for_the_user(itinerary):
    editors = build_editors(edit_context(itinerary, user_id=1, role="admin"))

    assert list(editors) == list(EDITORS)


def test_an_editor_that_is_not_available_is_left_out(itinerary):
    with patch.dict(EDITORS, {HiddenEditor.entity: HiddenEditor}):
        editors = build_editors(edit_context(itinerary))

    assert "hidden" not in editors

import pytest
from marshmallow import Schema
from src.ai_tasks import registry
from src.ai_tasks.handler import CONFLICTS_WITH_ANYTHING, AiTaskHandler
from src.exceptions import UnknownAiTaskTypeError


class _Params(Schema):
    pass


@pytest.fixture
def isolated_registry(monkeypatch):
    monkeypatch.setattr(registry, "_HANDLERS", {})


def test_registered_handler_is_found_by_type(isolated_registry):
    @registry.register
    class Dummy(AiTaskHandler):
        task_type = "dummy"
        label = "Dummy"
        params_schema = _Params

        def run(self, ctx):
            return []

    assert isinstance(registry.get_handler("dummy"), Dummy)
    assert "dummy" in registry.task_types()


def test_unknown_type_raises(isolated_registry):
    with pytest.raises(UnknownAiTaskTypeError):
        registry.get_handler("nope")


def test_handlers_conflict_with_anything_by_default(isolated_registry):
    class Dummy(AiTaskHandler):
        task_type = "dummy"
        label = "Dummy"
        params_schema = _Params

        def run(self, ctx):
            return []

    assert Dummy().conflict_scope({}) == CONFLICTS_WITH_ANYTHING

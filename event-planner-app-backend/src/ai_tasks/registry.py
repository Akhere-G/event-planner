from typing import TypeVar

from ..exceptions import UnknownAiTaskTypeError
from .handler import AiTaskHandler

_HANDLERS: dict[str, AiTaskHandler] = {}

H = TypeVar("H", bound=type[AiTaskHandler])


def register(handler_class: H) -> H:
    """Class decorator that makes a handler available under its `task_type`."""
    _HANDLERS[handler_class.task_type] = handler_class()
    return handler_class


def get_handler(task_type: str) -> AiTaskHandler:
    from . import handlers  # noqa: F401  (importing registers the handlers)

    try:
        return _HANDLERS[task_type]
    except KeyError:
        raise UnknownAiTaskTypeError() from None


def task_types() -> list[str]:
    from . import handlers  # noqa: F401

    return sorted(_HANDLERS)

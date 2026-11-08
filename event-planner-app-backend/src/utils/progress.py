from collections.abc import Callable

# (text, current step, total steps)
ProgressCallback = Callable[[str, int | None, int | None], None]


def no_progress(text: str, current: int | None = None, total: int | None = None) -> None:
    """Default for callers that do not report progress."""

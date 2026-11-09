from collections.abc import Callable

ProgressCallback = Callable[[str, int | None, int | None], None]


def no_progress(
    text: str, current: int | None = None, total: int | None = None
) -> None: ...

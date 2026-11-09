from ..runner import TaskRunner


class InlineDispatcher:
    def __init__(self, runner: TaskRunner | None = None):
        self._runner = runner or TaskRunner()

    def dispatch(self, task_id: int) -> str | None:
        self._runner.run_with_retries(task_id, sleep=lambda _seconds: None)
        return None

    def cancel(self, dispatch_name: str | None) -> None:
        return None

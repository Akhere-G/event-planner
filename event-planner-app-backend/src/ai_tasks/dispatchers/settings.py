import os
from dataclasses import dataclass


@dataclass(frozen=True)
class CloudTasksSettings:
    project: str
    location: str
    queue: str
    service_account_email: str
    # Public URL of this service: the callback host, and the OIDC token audience.
    base_url: str
    # Cloud Tasks gives up on a request after this long.
    dispatch_deadline_seconds: int = 900

    @classmethod
    def from_env(cls) -> "CloudTasksSettings":
        def required(name: str) -> str:
            value = os.getenv(name)
            if not value:
                raise RuntimeError(f"{name} must be set to use Cloud Tasks.")
            return value

        return cls(
            project=required("GCP_PROJECT"),
            location=required("GCP_LOCATION"),
            queue=required("CLOUD_TASKS_QUEUE"),
            service_account_email=required("CLOUD_TASKS_SERVICE_ACCOUNT"),
            base_url=required("SERVICE_BASE_URL").rstrip("/"),
        )

    def run_url(self, task_id: int) -> str:
        return f"{self.base_url}/api/internal/ai-tasks/{task_id}/run"

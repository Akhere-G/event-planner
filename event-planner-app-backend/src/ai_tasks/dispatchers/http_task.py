import json
from typing import Any

from google.cloud import tasks_v2
from google.protobuf import duration_pb2

from .settings import CloudTasksSettings


def build_http_task(
    settings: CloudTasksSettings,
    url: str,
    name: str | None = None,
    payload: dict[str, Any] | None = None,
) -> tasks_v2.Task:
    """A Cloud Task that POSTs back to this service, signed as the queue's account."""
    request = {
        "http_method": tasks_v2.HttpMethod.POST,
        "url": url,
        "oidc_token": tasks_v2.OidcToken(
            service_account_email=settings.service_account_email,
            audience=settings.base_url,
        ),
    }
    if payload is not None:
        request["headers"] = {"Content-Type": "application/json"}
        request["body"] = json.dumps(payload).encode()

    return tasks_v2.Task(
        name=name,
        dispatch_deadline=duration_pb2.Duration(
            seconds=settings.dispatch_deadline_seconds
        ),
        http_request=tasks_v2.HttpRequest(**request),
    )

from flask import Blueprint, request

from ..calendar_sync.connections import google_client_for_user
from ..calendar_sync.jobs import get_job_class, run_job
from ..calendar_sync.scheduled import run_scheduled_sync
from ..middleware.cloud_tasks_auth import cloud_tasks_only
from ..utils.format_response import api_response

internal_calendar_bp = Blueprint("internal_calendar", __name__)


@internal_calendar_bp.route("/jobs/<job_type>", methods=["POST"])
@cloud_tasks_only
def run_calendar_job_route(job_type: str):
    """Called by Cloud Tasks. A non-2xx answer makes the queue deliver it again."""
    job = get_job_class(job_type).from_payload(request.get_json())
    run_job(job)
    return api_response(success=True, message=f"Ran {job_type}.")


@internal_calendar_bp.route("/scheduled", methods=["POST"])
@cloud_tasks_only
def run_scheduled_sync_route():
    """Called daily by Cloud Scheduler."""
    result = run_scheduled_sync(google_client_for_user)
    return api_response(
        success=True,
        data={
            "channels_renewed": result.channels_renewed,
            "calendars_queued": result.calendars_queued,
        },
        message="Scheduled calendar sync queued.",
    )

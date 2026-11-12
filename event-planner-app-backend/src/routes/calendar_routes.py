import secrets

from flask import Blueprint, redirect, request, session

from ..calendar_sync.connections import (
    get_connection,
    google_client_for_user,
    save_refresh_token,
    synced_trip_ids,
)
from ..calendar_sync.disconnect import disconnect_account
from ..calendar_sync.jobs import dispatch_job
from ..calendar_sync.jobs.calendar_jobs import BootstrapCalendarJob
from ..calendar_sync.oauth import (
    build_authorization_url,
    exchange_code_for_refresh_token,
)
from ..calendar_sync.settings import get_settings
from ..calendar_sync.trip_sync import disable_trip_sync, enable_trip_sync
from ..calendar_sync.webhook import handle_notification
from ..extensions import db
from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..middleware.login_required import login_required
from ..models import Itinerary, UserRole
from ..schemas.calendar_schema import OAuthCallbackSchema
from ..utils.format_response import api_response

calendar_bp = Blueprint("calendar", __name__)

OAUTH_STATE_KEY = "calendar_oauth_state"
ALL_ROLES = [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]


def _settings_redirect(result: str):
    return redirect(f"{get_settings().frontend_url}/settings?calendar={result}")


@calendar_bp.route("/google/status", methods=["GET"])
@login_required
def status_route(user_id: int):
    return api_response(
        success=True,
        data={
            "connected": get_connection(user_id) is not None,
            "synced_trip_ids": synced_trip_ids(user_id),
        },
        message="Fetched calendar status.",
    )


@calendar_bp.route("/google/connect", methods=["POST"])
@login_required
def connect_route(user_id: int):
    state = secrets.token_urlsafe(24)
    session[OAUTH_STATE_KEY] = state
    return api_response(
        success=True,
        data={"url": build_authorization_url(state)},
        message="Created authorisation link.",
    )


@calendar_bp.route("/google/callback", methods=["GET"])
@login_required
def callback_route(user_id: int):
    args = OAuthCallbackSchema().load(request.args)
    expected = session.pop(OAUTH_STATE_KEY, None)
    if not (
        expected
        and args["code"]
        and secrets.compare_digest(expected.encode(), args["state"].encode())
    ):
        return _settings_redirect("failed")

    save_refresh_token(user_id, exchange_code_for_refresh_token(args["code"]))
    return _settings_redirect("connected")


@calendar_bp.route("/google/connection", methods=["DELETE"])
@login_required
def disconnect_route(user_id: int):
    disconnect_account(user_id, google_client_for_user)
    return api_response(success=True, message="Disconnected Google Calendar.")


@calendar_bp.route("/google/trips/<int:itinerary_id>", methods=["PUT"])
@login_required
@itinerary_access_required(allowed_roles=ALL_ROLES)
def enable_trip_route(itinerary_id: int, access: ItineraryAccess, user_id: int):
    itinerary = db.session.get(Itinerary, itinerary_id)
    trip_calendar = enable_trip_sync(user_id, itinerary, google_client_for_user)
    dispatch_job(BootstrapCalendarJob(trip_calendar.id))
    return api_response(success=True, message="Google Calendar sync enabled.")


@calendar_bp.route("/google/trips/<int:itinerary_id>", methods=["DELETE"])
@login_required
@itinerary_access_required(allowed_roles=ALL_ROLES)
def disable_trip_route(itinerary_id: int, access: ItineraryAccess, user_id: int):
    disable_trip_sync(user_id, itinerary_id, google_client_for_user)
    return api_response(success=True, message="Google Calendar sync disabled.")


@calendar_bp.route("/google/webhook", methods=["POST"])
def webhook_route():
    handle_notification(
        request.headers.get("X-Goog-Channel-ID", ""),
        request.headers.get("X-Goog-Channel-Token", ""),
        request.headers.get("X-Goog-Resource-State", ""),
    )
    return api_response(success=True, message="Accepted.")

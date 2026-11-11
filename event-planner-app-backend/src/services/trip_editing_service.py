"""Natural-language trip editing: a chat request becomes a proposal to review.

Nothing is written to the trip. The proposed ops are stored as a ready AI task so the
user can accept or reject them like any other AI proposal.
"""

from dataclasses import dataclass
from typing import Any

from sqlalchemy import select

from ..ai_tasks import snapshots
from ..exceptions import AIResponseError
from ..extensions import db
from ..models import AiTask, ItineraryUser, User
from ..utils.db_utils import release_connection
from .ai_services import format_json, get_ai_response
from .ai_task_service import create_proposal
from .change_set_service import build_edit_ops
from .flight_context import blocked_windows
from .itineraries_service import get_itinerary
from .trip_edit.editor_base import EditContext
from .trip_edit.prompt import ChatTurn, build_edit_prompt
from .trip_edit.registry import build_editors
from .trip_edit.sanitiser import sanitise_edit_ops

EDIT_TRIP_TASK_TYPE = "edit_trip"
MAX_REPLY_LENGTH = 1000
REPLY_WITH_CHANGES = "Here are the changes I suggest."
REPLY_WITHOUT_CHANGES = "I couldn't work out a change for that. Could you rephrase?"


@dataclass(frozen=True)
class TripEditResult:
    reply: str
    task: AiTask | None


def _member_names(itinerary_id: int) -> dict[int, str]:
    stmt = (
        select(User.id, User.username)
        .join(ItineraryUser, ItineraryUser.user_id == User.id)
        .where(ItineraryUser.itinerary_id == itinerary_id)
    )
    names = {}
    for user_id, username in db.session.execute(stmt):
        names[user_id] = username
    return names


def _reply(result: dict[str, Any], has_ops: bool) -> str:
    text = result.get("reply")
    if isinstance(text, str) and text.strip():
        return text.strip()[:MAX_REPLY_LENGTH]
    return REPLY_WITH_CHANGES if has_ops else REPLY_WITHOUT_CHANGES


def edit_trip_with_ai(
    itinerary_id: int,
    user_id: int | None,
    role: str | None,
    message: str,
    history: list[ChatTurn],
) -> TripEditResult:
    itinerary = get_itinerary(itinerary_id)
    flights = blocked_windows(itinerary_id, itinerary.timezone)
    members = _member_names(itinerary_id)
    context = EditContext(itinerary, user_id, role, flights, members)
    editors = build_editors(context)
    prompt = build_edit_prompt(itinerary, editors, flights, message, history)
    # Taken before the slow AI call, so edits made while it runs show up as stale.
    snapshot = snapshots.capture(itinerary_id)
    release_connection()

    result = format_json(get_ai_response(prompt))
    if not isinstance(result, dict):
        raise AIResponseError("AI response must be an object.")

    proposed = sanitise_edit_ops(result.get("ops") or [], editors)
    ops = snapshots.attach_bases(
        build_edit_ops(itinerary_id, user_id, proposed, role), snapshot
    )
    task = None
    if ops:
        task = create_proposal(
            itinerary_id, EDIT_TRIP_TASK_TYPE, {"message": message}, ops, user_id
        )
    return TripEditResult(reply=_reply(result, bool(ops)), task=task)

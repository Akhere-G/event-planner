import logging

from flask import request, session as flask_session
from flask_socketio import ConnectionRefusedError, join_room, leave_room

from ..extensions import db, socketio
from ..models import User
from .access import resolve_trip_role
from .presence import get_presence_store
from .rooms import PRESENCE_EVENT, trip_room

logger = logging.getLogger(__name__)

GUEST_NAME = "Guest"


# A websocket lives in exactly one process, so per-connection identity is kept here.
_connections: dict[str, dict] = {}


def _identity(sid: str) -> dict:
    return _connections[sid]


def _trip_id(data) -> int | None:
    trip_id = data.get("trip_id") if isinstance(data, dict) else None
    return trip_id if isinstance(trip_id, int) and not isinstance(trip_id, bool) else None


def _broadcast_presence(trip_id: int):
    socketio.emit(
        PRESENCE_EVENT,
        {"trip_id": trip_id, "users": get_presence_store().list_users(trip_id)},
        to=trip_room(trip_id),
    )


def _display_name(user_id: int | None) -> str:
    if user_id is None:
        return GUEST_NAME
    user = db.session.get(User, user_id)
    return user.username if user else GUEST_NAME


def _day(data) -> str | None:
    day = data.get("day") if isinstance(data, dict) else None
    return day if isinstance(day, str) and len(day) <= 32 else None


_registered = False


def register_socket_handlers():
    global _registered
    if _registered:
        return
    _registered = True

    @socketio.on("connect")
    def on_connect(auth):
        # The session cookie is sent with the websocket upgrade; anonymous trips
        # send their access code in the socket.io auth payload instead.
        user_id = flask_session.get("user_id")
        access_code = auth.get("access_code") if isinstance(auth, dict) else None

        if user_id is None and not access_code:
            raise ConnectionRefusedError("Not authorised")

        _connections[request.sid] = {  # type: ignore[attr-defined]
            "user_id": user_id,
            "access_code": access_code,
            "trips": {},
        }

    @socketio.on("trip:join")
    def on_join(data):
        sid = request.sid  # type: ignore[attr-defined]
        trip_id = _trip_id(data)
        if trip_id is None:
            return {"ok": False, "error": "Invalid trip"}

        identity = _identity(sid)
        role = resolve_trip_role(
            trip_id, identity["user_id"], identity["access_code"]
        )
        if role is None:
            return {"ok": False, "error": "Not authorised"}

        join_room(trip_room(trip_id))
        identity["trips"][trip_id] = _display_name(identity["user_id"])

        get_presence_store().set(
            trip_id,
            sid,
            {"user_id": identity["user_id"], "name": identity["trips"][trip_id]},
            _day(data),
        )
        _broadcast_presence(trip_id)
        return {"ok": True, "role": role}

    @socketio.on("trip:leave")
    def on_leave(data):
        sid = request.sid  # type: ignore[attr-defined]
        trip_id = _trip_id(data)
        identity = _identity(sid)
        if trip_id is None or trip_id not in identity["trips"]:
            return

        leave_room(trip_room(trip_id))
        identity["trips"].pop(trip_id)
        get_presence_store().remove(trip_id, sid)
        _broadcast_presence(trip_id)

    @socketio.on("presence:heartbeat")
    def on_heartbeat(data):
        """Refreshes the TTL and records the day being viewed (None = no day)."""
        sid = request.sid  # type: ignore[attr-defined]
        trip_id = _trip_id(data)
        identity = _identity(sid)
        if trip_id is None or trip_id not in identity["trips"]:
            return

        store = get_presence_store()
        before = store.list_users(trip_id)
        store.set(
            trip_id,
            sid,
            {"user_id": identity["user_id"], "name": identity["trips"][trip_id]},
            _day(data),
        )
        if store.list_users(trip_id) != before:
            _broadcast_presence(trip_id)

    @socketio.on("disconnect")
    def on_disconnect(*_args):
        sid = request.sid  # type: ignore[attr-defined]
        identity = _connections.pop(sid, None)
        if identity is None:
            return
        for trip_id in list(identity.get("trips", {})):
            get_presence_store().remove(trip_id, sid)
            _broadcast_presence(trip_id)

import logging

from ..extensions import socketio

logger = logging.getLogger(__name__)


def safe_emit(event_name: str, payload: dict, room: str):
    try:
        socketio.emit(event_name, payload, to=room)
    except Exception:
        # A broken queue must never fail a request whose commit already succeeded.
        logger.exception("Failed to broadcast %s to %s", event_name, room)

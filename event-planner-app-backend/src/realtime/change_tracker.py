import logging
from collections import defaultdict
from typing import Callable

from flask import has_request_context, session as flask_session
from sqlalchemy import event
from sqlalchemy.orm import Session

from ..extensions import socketio
from .rooms import TRIP_CHANGED_EVENT, trip_room

logger = logging.getLogger(__name__)

SESSION_INFO_KEY = "realtime_changes"

# Maps a model class to (entity name, resolver returning the owning itinerary id).
# Later features (expenses, flights) add themselves here with register_tracked_model.
_TRACKED: dict[type, tuple[str, Callable[[Session, object], int | None]]] = {}


def register_tracked_model(model, entity: str, resolver: Callable | None = None):
    _TRACKED[model] = (
        entity,
        resolver or (lambda _session, obj: getattr(obj, "itinerary_id", None)),
    )


def _wishlist_itinerary_id(session: Session, wishlist_id: int | None):
    from ..models import Wishlist

    if wishlist_id is None:
        return None
    wishlist = session.get(Wishlist, wishlist_id)
    return wishlist.itinerary_id if wishlist else None


def _item_itinerary_id(session: Session, obj):
    from ..models import WishlistItem

    item = obj.wishlist_item if hasattr(obj, "wishlist_item") else obj
    wishlist_id = getattr(item, "wishlist_id", None)
    if wishlist_id is None and hasattr(obj, "wishlist_item_id"):
        parent = session.get(WishlistItem, obj.wishlist_item_id)
        wishlist_id = parent.wishlist_id if parent else None
    return _wishlist_itinerary_id(session, wishlist_id)


def register_default_models():
    from ..models import (
        Accommodation,
        Event,
        Itinerary,
        PackingItem,
        Wishlist,
        WishlistItem,
        WishlistItemVote,
    )

    register_tracked_model(Event, "event")
    register_tracked_model(Accommodation, "accommodation")
    register_tracked_model(PackingItem, "packing")
    register_tracked_model(Wishlist, "wishlist")
    register_tracked_model(Itinerary, "itinerary", lambda _s, obj: obj.id)
    register_tracked_model(WishlistItem, "wishlist", _item_itinerary_id)
    register_tracked_model(WishlistItemVote, "wishlist", _item_itinerary_id)


def collect_changes(session: Session, flush_context):
    changes = session.info.setdefault(SESSION_INFO_KEY, defaultdict(set))

    # A backref append marks the parent dirty without changing its row, so only
    # count dirty objects whose own columns changed.
    dirty = [o for o in session.dirty if session.is_modified(o, include_collections=False)]

    for obj in [*session.new, *dirty, *session.deleted]:
        tracked = _TRACKED.get(type(obj))
        if tracked is None:
            continue
        entity, resolver = tracked
        try:
            itinerary_id = resolver(session, obj)
        except Exception:
            logger.exception("Could not resolve trip for %s", type(obj).__name__)
            continue
        if itinerary_id is not None:
            changes[itinerary_id].add(entity)


def emit_changes(session: Session):
    changes = session.info.pop(SESSION_INFO_KEY, None)
    if not changes:
        return

    by_user_id = flask_session.get("user_id") if has_request_context() else None

    for itinerary_id, entities in changes.items():
        try:
            socketio.emit(
                TRIP_CHANGED_EVENT,
                {
                    "trip_id": itinerary_id,
                    "entities": sorted(entities),
                    "by_user_id": by_user_id,
                },
                to=trip_room(itinerary_id),
            )
        except Exception:
            # A broken queue must never fail a request whose commit already succeeded.
            logger.exception("Failed to broadcast change for trip %s", itinerary_id)


def discard_changes(session: Session):
    session.info.pop(SESSION_INFO_KEY, None)


_registered = False


def register_change_tracking():
    global _registered
    if _registered:
        return
    _registered = True
    register_default_models()
    event.listen(Session, "after_flush", collect_changes)
    event.listen(Session, "after_commit", emit_changes)
    event.listen(Session, "after_rollback", discard_changes)

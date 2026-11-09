import logging
from collections import defaultdict
from collections.abc import Callable
from dataclasses import dataclass

from flask import has_request_context
from flask import session as flask_session
from sqlalchemy import event, select
from sqlalchemy.orm import Session

from .emit import safe_emit
from .rooms import TRIP_CHANGED_EVENT, USER_CHANGED_EVENT, trip_room, user_room

logger = logging.getLogger(__name__)

SESSION_INFO_KEY = "realtime_changes"
USER_SESSION_INFO_KEY = "realtime_user_changes"

Resolver = Callable[[Session, object], int | None]


@dataclass(frozen=True)
class TrackedModel:
    entity: str
    # The trip whose room hears about the change.
    trip_resolver: Resolver
    # A user who is not necessarily in that room (e.g. someone who has been
    # invited but has not joined yet) and so needs a notice of their own.
    user_resolver: Resolver | None = None


# Models are registered in register_default_models with register_tracked_model.
_TRACKED: dict[type, TrackedModel] = {}


def register_tracked_model(
    model: type,
    entity: str,
    resolver: Resolver | None = None,
    user_resolver: Resolver | None = None,
):
    _TRACKED[model] = TrackedModel(
        entity,
        resolver or (lambda _session, obj: getattr(obj, "itinerary_id", None)),
        user_resolver,
    )


def _wishlist_item_itinerary_id(session: Session, obj):
    from ..models import (
        Wishlist,
    )

    wishlist = session.get(Wishlist, obj.wishlist_id)
    return wishlist.itinerary_id if wishlist else None


def _wishlist_item_vote_itinerary_id(session: Session, obj):
    from ..models import Wishlist, WishlistItem

    item = session.get(WishlistItem, obj.wishlist_item_id)
    if item is None:
        return None

    wishlist = session.get(Wishlist, item.wishlist_id)
    return wishlist.itinerary_id if wishlist else None


def _expense_share_itinerary_id(session: Session, obj):
    from ..models import Expense

    expense = session.get(Expense, obj.expense_id)
    return expense.itinerary_id if expense else None


def _invitee_user_id(session: Session, obj):
    from ..models import User

    return session.execute(
        select(User.id).where(User.email == obj.email)
    ).scalar_one_or_none()


def _member_user_id(_session: Session, obj):
    return obj.user_id


def register_default_models():
    from ..models import (
        Accommodation,
        Event,
        Expense,
        ExpenseShare,
        Flight,
        Invite,
        Itinerary,
        ItineraryUser,
        PackingItem,
        Settlement,
        Wishlist,
        WishlistItem,
        WishlistItemVote,
    )

    register_tracked_model(Event, "event")
    register_tracked_model(Accommodation, "accommodation")
    register_tracked_model(PackingItem, "packing")
    register_tracked_model(Wishlist, "wishlist")
    register_tracked_model(Itinerary, "itinerary", lambda _s, obj: obj.id)
    register_tracked_model(WishlistItem, "wishlist_item", _wishlist_item_itinerary_id)
    register_tracked_model(
        WishlistItemVote, "wishlist_item_vote", _wishlist_item_vote_itinerary_id
    )
    register_tracked_model(Flight, "flight")
    register_tracked_model(Expense, "expense")
    register_tracked_model(
        ExpenseShare, "expense_share", _expense_share_itinerary_id
    )
    register_tracked_model(Settlement, "settlement")
    register_tracked_model(
        ItineraryUser, "itinerary_user", user_resolver=_member_user_id
    )
    register_tracked_model(Invite, "invite", user_resolver=_invitee_user_id)


def _resolve(resolver: Resolver | None, session: Session, obj) -> int | None:
    if resolver is None:
        return None
    try:
        return resolver(session, obj)
    except Exception:
        logger.exception("Could not resolve target for %s", type(obj).__name__)
        return None


def collect_changes(session: Session, flush_context):
    changes = session.info.setdefault(SESSION_INFO_KEY, defaultdict(set))
    user_changes = session.info.setdefault(
        USER_SESSION_INFO_KEY,
        defaultdict(lambda: {"entities": set(), "trip_ids": set()}),
    )

    # A backref append marks the parent dirty without changing its row, so only
    # count dirty objects whose own columns changed.
    dirty = [
        o for o in session.dirty if session.is_modified(o, include_collections=False)
    ]

    for obj in [*session.new, *dirty, *session.deleted]:
        tracked = _TRACKED.get(type(obj))
        if tracked is None:
            continue

        itinerary_id = _resolve(tracked.trip_resolver, session, obj)
        if itinerary_id is not None:
            changes[itinerary_id].add(tracked.entity)

        user_id = _resolve(tracked.user_resolver, session, obj)
        if user_id is not None:
            user_changes[user_id]["entities"].add(tracked.entity)
            if itinerary_id is not None:
                user_changes[user_id]["trip_ids"].add(itinerary_id)


def emit_changes(session: Session):
    changes = session.info.pop(SESSION_INFO_KEY, None)
    user_changes = session.info.pop(USER_SESSION_INFO_KEY, None)
    if not changes and not user_changes:
        return

    by_user_id = flask_session.get("user_id") if has_request_context() else None

    for itinerary_id, entities in (changes or {}).items():
        safe_emit(
            TRIP_CHANGED_EVENT,
            {
                "trip_id": itinerary_id,
                "entities": sorted(entities),
                "by_user_id": by_user_id,
            },
            trip_room(itinerary_id),
        )

    for user_id, change in (user_changes or {}).items():
        if not change["entities"]:
            continue
        safe_emit(
            USER_CHANGED_EVENT,
            {
                "entities": sorted(change["entities"]),
                "trip_ids": sorted(change["trip_ids"]),
                "by_user_id": by_user_id,
            },
            user_room(user_id),
        )


def discard_changes(session: Session):
    session.info.pop(SESSION_INFO_KEY, None)
    session.info.pop(USER_SESSION_INFO_KEY, None)


_registered = False


def register_change_tracking():
    global _registered
    if _registered:
        return
    register_default_models()
    event.listen(Session, "after_flush", collect_changes)
    event.listen(Session, "after_commit", emit_changes)
    event.listen(Session, "after_rollback", discard_changes)
    _registered = True

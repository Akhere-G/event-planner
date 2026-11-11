"""Detects proposals that went stale while they waited for a decision.

When a task starts, the `updated_at` of every row it might touch is recorded. Each
update/delete op carries that value as `base`. On accept, an op whose target was
edited since is still applied (the user is warned it may overwrite those edits); one
whose target was deleted can no longer be applied.
"""

from collections.abc import Callable
from enum import StrEnum
from typing import Any

from sqlalchemy import Select, select

from ..extensions import db
from ..models import (
    Accommodation,
    Event,
    Expense,
    Itinerary,
    PackingItem,
    Settlement,
    Wishlist,
    WishlistItem,
)
from ..services.change_set_types import ChangeOp

Snapshot = dict[str, dict[int, str | None]]

_SELECTS: dict[str, Callable[[int], Select]] = {
    "trip": lambda trip: select(Itinerary.id, Itinerary.updated_at).where(
        Itinerary.id == trip
    ),
    "event": lambda trip: select(Event.id, Event.updated_at).where(
        Event.itinerary_id == trip
    ),
    "accommodation": lambda trip: select(
        Accommodation.id, Accommodation.updated_at
    ).where(Accommodation.itinerary_id == trip),
    "packing_item": lambda trip: select(PackingItem.id, PackingItem.updated_at).where(
        PackingItem.itinerary_id == trip
    ),
    "expense": lambda trip: select(Expense.id, Expense.updated_at).where(
        Expense.itinerary_id == trip
    ),
    "settlement": lambda trip: select(Settlement.id, Settlement.updated_at).where(
        Settlement.itinerary_id == trip
    ),
    "wishlist": lambda trip: select(Wishlist.id, Wishlist.updated_at).where(
        Wishlist.itinerary_id == trip
    ),
    "wishlist_item": lambda trip: (
        select(WishlistItem.id, WishlistItem.updated_at)
        .join(Wishlist, Wishlist.id == WishlistItem.wishlist_id)
        .where(Wishlist.itinerary_id == trip)
    ),
}

CHANGING_OPS = ("update", "delete")


class Staleness(StrEnum):
    CHANGED = "changed"
    DELETED = "deleted"


def _iso(value) -> str | None:
    return value.isoformat() if value is not None else None


def capture(itinerary_id: int) -> Snapshot:
    snapshot: Snapshot = {}
    for entity, select_rows in _SELECTS.items():
        snapshot[entity] = {}
        for row in db.session.execute(select_rows(itinerary_id)):
            snapshot[entity][row.id] = _iso(row.updated_at)
    return snapshot


def attach_bases(ops: list[ChangeOp], snapshot: Snapshot) -> list[ChangeOp]:
    with_bases = []
    for op in ops:
        if op["op"] in CHANGING_OPS:
            updated_at = snapshot.get(op["entity"], {}).get(op["id"])
            with_bases.append({**op, "base": {"updated_at": updated_at}})
        else:
            with_bases.append(op)
    return with_bases


def find_stale(itinerary_id: int, ops: list[dict[str, Any]]) -> dict[int, Staleness]:
    """Op index -> staleness of its target; untouched ops are absent."""
    current = capture(itinerary_id)
    stale: dict[int, Staleness] = {}
    for index, op in enumerate(ops):
        if op["op"] not in CHANGING_OPS:
            continue
        rows = current.get(op["entity"], {})
        if op["id"] not in rows:
            stale[index] = Staleness.DELETED
        elif rows[op["id"]] != (op.get("base") or {}).get("updated_at"):
            stale[index] = Staleness.CHANGED
    return stale


def strip_base(op: dict[str, Any]) -> dict[str, Any]:
    without_base = dict(op)
    without_base.pop("base", None)
    return without_base

"""Detects proposals that went stale while they waited for a decision.

When a task starts, the `updated_at` of every row it might touch is recorded. Each
update/delete op carries that value as `base`. On accept an op whose target was edited
since is still applied (the user is warned it may overwrite those edits); one whose target
was deleted can no longer be applied.
"""

from collections.abc import Callable
from enum import Enum
from typing import Any

from sqlalchemy import Select, select

from ..extensions import db
from ..models import Accommodation, Event, PackingItem, Wishlist, WishlistItem

# entity -> {row id: updated_at as ISO string}
Snapshot = dict[str, dict[int, str | None]]

_SELECTS: dict[str, Callable[[int], Select]] = {
    "event": lambda trip: select(Event.id, Event.updated_at).where(
        Event.itinerary_id == trip
    ),
    "accommodation": lambda trip: select(
        Accommodation.id, Accommodation.updated_at
    ).where(Accommodation.itinerary_id == trip),
    "packing_item": lambda trip: select(PackingItem.id, PackingItem.updated_at).where(
        PackingItem.itinerary_id == trip
    ),
    "wishlist_item": lambda trip: select(WishlistItem.id, WishlistItem.updated_at)
    .join(Wishlist, Wishlist.id == WishlistItem.wishlist_id)
    .where(Wishlist.itinerary_id == trip),
}

CHANGING_OPS = ("update", "delete")


class Staleness(str, Enum):
    CHANGED = "changed"
    DELETED = "deleted"


def _iso(value) -> str | None:
    return value.isoformat() if value is not None else None


def capture(itinerary_id: int) -> Snapshot:
    return {
        entity: {row.id: _iso(row.updated_at) for row in db.session.execute(stmt(itinerary_id))}
        for entity, stmt in _SELECTS.items()
    }


def attach_bases(ops: list[dict[str, Any]], snapshot: Snapshot) -> list[dict[str, Any]]:
    """Record, on each update/delete op, the state of its target when the task began."""
    return [
        {**op, "base": {"updated_at": snapshot.get(op["entity"], {}).get(op["id"])}}
        if op["op"] in CHANGING_OPS
        else op
        for op in ops
    ]


def find_stale(itinerary_id: int, ops: list[dict[str, Any]]) -> dict[int, Staleness]:
    """Op index -> how its target differs now from when the task began (untouched ops are absent)."""
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
    return {key: value for key, value in op.items() if key != "base"}

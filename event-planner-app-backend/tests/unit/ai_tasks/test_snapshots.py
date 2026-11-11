from src.ai_tasks.snapshots import (
    Staleness,
    attach_bases,
    capture,
    find_stale,
    strip_base,
)
from src.extensions import db
from tests.factories import EventFactory


def stored_iso(event):
    # Python-side defaults are tz-aware; the database returns naive UTC.
    return event.updated_at.replace(tzinfo=None).isoformat()


def update_op(event):
    return {"op": "update", "entity": "event", "id": event.id, "data": {}}


def test_capture_records_updated_at_for_the_trips_events(itinerary):
    event = EventFactory(itinerary=itinerary)

    snapshot = capture(itinerary.id)

    assert snapshot["event"][event.id] == stored_iso(event)


def test_capture_records_the_trip_itself(itinerary):
    snapshot = capture(itinerary.id)

    assert snapshot["trip"] == {itinerary.id: stored_iso(itinerary)}


def test_only_update_and_delete_ops_get_a_base(itinerary):
    event = EventFactory(itinerary=itinerary)
    create = {"op": "create", "entity": "event", "data": {}}

    ops = attach_bases([create, update_op(event)], capture(itinerary.id))

    assert "base" not in ops[0]
    assert ops[1]["base"] == {"updated_at": stored_iso(event)}


def test_untouched_targets_are_not_stale(itinerary):
    event = EventFactory(itinerary=itinerary)
    ops = attach_bases([update_op(event)], capture(itinerary.id))

    assert find_stale(itinerary.id, ops) == {}


def test_edited_target_is_changed(itinerary):
    event = EventFactory(itinerary=itinerary)
    ops = attach_bases([update_op(event)], capture(itinerary.id))

    event.name = "Renamed"
    event.updated_at = event.updated_at.replace(year=2030)
    db.session.flush()

    assert find_stale(itinerary.id, ops) == {0: Staleness.CHANGED}


def test_deleted_target_is_deleted(itinerary):
    event = EventFactory(itinerary=itinerary)
    ops = attach_bases([update_op(event)], capture(itinerary.id))

    db.session.delete(event)
    db.session.flush()

    assert find_stale(itinerary.id, ops) == {0: Staleness.DELETED}


def test_creates_are_never_stale(itinerary):
    ops = [{"op": "create", "entity": "event", "data": {}}]

    assert find_stale(itinerary.id, ops) == {}


def test_strip_base_removes_only_the_snapshot():
    op = {
        "op": "update",
        "entity": "event",
        "id": 1,
        "data": {},
        "base": {"updated_at": "x"},
    }

    assert strip_base(op) == {"op": "update", "entity": "event", "id": 1, "data": {}}

import pytest
from src.extensions import db
from src.models import Accommodation, Event, PackingItem, Wishlist, WishlistItem
from src.realtime.change_tracker import (
    _LISTENERS,
    SESSION_INFO_KEY,
    EntityChange,
    register_change_listener,
)
from tests.factories import (
    EventFactory,
    WishlistFactory,
    WishlistItemFactory,
    WishlistItemVoteFactory,
)


@pytest.fixture
def emitted(monkeypatch, itinerary, admin_user, admin_itinerary_user):
    db.session.commit()
    calls = []
    monkeypatch.setattr(
        "src.realtime.change_tracker.socketio.emit",
        lambda event, payload, **kwargs: calls.append((event, payload, kwargs)),
    )
    return calls


def test_flush_records_change_without_emitting(emitted, itinerary, admin_user):
    EventFactory(itinerary=itinerary, creator=admin_user)

    assert db.session.info[SESSION_INFO_KEY][itinerary.id] == {"event"}
    assert emitted == []


def test_commit_emits_once_per_trip_with_all_entities(emitted, itinerary, admin_user):
    EventFactory(itinerary=itinerary, creator=admin_user)
    EventFactory(itinerary=itinerary, creator=admin_user)
    WishlistFactory(itinerary=itinerary, creator=admin_user)

    db.session.commit()

    assert len(emitted) == 1
    event_name, payload, kwargs = emitted[0]
    assert event_name == "trip:changed"
    assert payload == {
        "trip_id": itinerary.id,
        "entities": ["event", "wishlist"],
        "by_user_id": None,
    }
    assert kwargs["to"] == f"trip:{itinerary.id}"
    assert SESSION_INFO_KEY not in db.session.info


def test_update_and_delete_are_recorded(emitted, itinerary, admin_user):
    event = EventFactory(itinerary=itinerary, creator=admin_user)
    db.session.commit()
    emitted.clear()

    event.name = "Renamed"
    db.session.commit()
    assert emitted[-1][1]["entities"] == ["event"]

    db.session.delete(event)
    db.session.commit()
    assert emitted[-1][1]["entities"] == ["event"]


def test_wishlist_items_and_votes_resolve_trip_through_parent(
    emitted, itinerary, admin_user, wishlist
):
    db.session.commit()
    emitted.clear()

    item = WishlistItemFactory(wishlist=wishlist, creator=admin_user)
    db.session.commit()
    assert emitted[-1][1] == {
        "trip_id": itinerary.id,
        "entities": ["wishlist"],
        "by_user_id": None,
    }

    emitted.clear()
    WishlistItemVoteFactory(wishlist_item=item, user=admin_user, creator=admin_user)
    db.session.commit()
    assert emitted[-1][1]["trip_id"] == itinerary.id
    assert emitted[-1][1]["entities"] == ["wishlist"]


def test_rollback_discards_changes(emitted, itinerary, admin_user):
    EventFactory(itinerary=itinerary, creator=admin_user)
    assert SESSION_INFO_KEY in db.session.info

    db.session.rollback()

    assert SESSION_INFO_KEY not in db.session.info
    db.session.commit()
    assert emitted == []


def test_untracked_models_do_not_emit(emitted, non_member_user):
    non_member_user.username = "changed"
    db.session.commit()

    assert emitted == []


def test_emit_failure_does_not_break_commit(monkeypatch, itinerary, admin_user, admin_itinerary_user):
    db.session.commit()

    def boom(*_args, **_kwargs):
        raise RuntimeError("redis down")

    monkeypatch.setattr("src.realtime.change_tracker.socketio.emit", boom)
    EventFactory(itinerary=itinerary, creator=admin_user)

    db.session.commit()


def test_by_user_id_comes_from_request_session(emitted, app, itinerary, admin_user):
    with app.test_request_context():
        from flask import session

        session["user_id"] = admin_user.id
        EventFactory(itinerary=itinerary, creator=admin_user)
        db.session.commit()

    assert emitted[-1][1]["by_user_id"] == admin_user.id


@pytest.fixture
def received():
    batches = []
    register_change_listener(batches.append)
    yield batches
    _LISTENERS.remove(batches.append)


def test_listeners_receive_entity_ids_and_deletions(
    emitted, received, itinerary, admin_user
):
    event = EventFactory(itinerary=itinerary, creator=admin_user)
    db.session.commit()
    assert received[-1] == [EntityChange(itinerary.id, "event", event.id, False)]

    event_id = event.id
    db.session.delete(event)
    db.session.commit()
    assert received[-1] == [EntityChange(itinerary.id, "event", event_id, True)]

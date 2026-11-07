import pytest
from src.extensions import db
from src.models import Accommodation, Event, PackingItem, Wishlist, WishlistItem
from src.realtime.change_tracker import SESSION_INFO_KEY, USER_SESSION_INFO_KEY
from tests.factories import (
    EventFactory,
    InviteFactory,
    ItineraryUserFactory,
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
        "entities": ["wishlist_item"],
        "by_user_id": None,
    }

    emitted.clear()
    WishlistItemVoteFactory(wishlist_item=item, user=admin_user, creator=admin_user)
    db.session.commit()
    assert emitted[-1][1]["trip_id"] == itinerary.id
    assert emitted[-1][1]["entities"] == ["wishlist_item_vote"]


def test_flights_invites_and_memberships_are_tracked(
    emitted, itinerary, admin_user, flight, invite, viewer_user
):
    db.session.commit()
    emitted.clear()

    flight.airline = "Changed Air"
    db.session.commit()
    assert emitted[-1][1]["entities"] == ["flight"]

    invite.status = "revoked"
    db.session.commit()
    assert emitted[-1][1]["entities"] == ["invite"]

    ItineraryUserFactory(
        itinerary=itinerary, user=viewer_user, creator=admin_user, role="viewer"
    )
    db.session.commit()
    trip_notice = [c for c in emitted if c[0] == "trip:changed"][-1]
    assert trip_notice[1]["entities"] == ["itinerary_user"]
    assert trip_notice[2]["to"] == f"trip:{itinerary.id}"


def test_invitee_is_notified_in_their_own_room(
    emitted, itinerary, admin_user, invite, invited_user
):
    db.session.commit()
    emitted.clear()

    invite.status = "revoked"
    db.session.commit()

    user_notice = [c for c in emitted if c[0] == "user:changed"]
    assert len(user_notice) == 1
    _, payload, kwargs = user_notice[0]
    assert payload == {
        "entities": ["invite"],
        "trip_ids": [itinerary.id],
        "by_user_id": None,
    }
    assert kwargs["to"] == f"user:{invited_user.id}"


def test_member_is_notified_when_added_or_removed(
    emitted, itinerary, admin_user, viewer_user
):
    membership = ItineraryUserFactory(
        itinerary=itinerary, user=viewer_user, creator=admin_user
    )
    db.session.commit()
    added = [c for c in emitted if c[0] == "user:changed"][-1]
    assert added[1]["entities"] == ["itinerary_user"]
    assert added[1]["trip_ids"] == [itinerary.id]
    assert added[2]["to"] == f"user:{viewer_user.id}"

    emitted.clear()
    db.session.delete(membership)
    db.session.commit()
    removed = [c for c in emitted if c[0] == "user:changed"][-1]
    assert removed[2]["to"] == f"user:{viewer_user.id}"


def test_invite_for_unregistered_email_only_reaches_the_trip(
    emitted, itinerary, admin_user
):
    InviteFactory(itinerary=itinerary, creator=admin_user, email="nobody@example.com")
    db.session.commit()

    assert [c[0] for c in emitted] == ["trip:changed"]


def test_rollback_discards_user_changes(emitted, itinerary, admin_user, invite):
    db.session.commit()
    emitted.clear()

    invite.status = "revoked"
    db.session.flush()
    assert USER_SESSION_INFO_KEY in db.session.info

    db.session.rollback()
    assert USER_SESSION_INFO_KEY not in db.session.info


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

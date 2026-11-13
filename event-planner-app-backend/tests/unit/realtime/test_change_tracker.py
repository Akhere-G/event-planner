import pytest
from src.extensions import db
from src.models import (
    Accommodation,
    Event,
    Expense,
    ExpenseShare,
    PackingItem,
    Wishlist,
    WishlistItem,
)
from src.realtime.change_tracker import (
    RECORDS_INFO_KEY,
    SESSION_INFO_KEY,
    USER_SESSION_INFO_KEY,
    EntityChange,
)
from tests.factories import (
    EventFactory,
    ExpenseFactory,
    ExpenseShareFactory,
    FlightFactory,
    SettlementFactory,
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
        "src.realtime.emit.socketio.emit",
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

    monkeypatch.setattr("src.realtime.emit.socketio.emit", boom)
    EventFactory(itinerary=itinerary, creator=admin_user)

    db.session.commit()


def test_by_user_id_comes_from_request_session(emitted, app, itinerary, admin_user):
    with app.test_request_context():
        from flask import session

        session["user_id"] = admin_user.id
        EventFactory(itinerary=itinerary, creator=admin_user)
        db.session.commit()

    assert emitted[-1][1]["by_user_id"] == admin_user.id


def trip_notices(emitted):
    return [payload for name, payload, _ in emitted if name == "trip:changed"]


def test_expenses_and_their_shares_are_tracked(emitted, itinerary, admin_user):
    expense = ExpenseFactory(itinerary=itinerary, paid_by=admin_user)
    ExpenseShareFactory(expense=expense, user=admin_user)
    db.session.commit()
    assert trip_notices(emitted)[-1]["entities"] == ["expense", "expense_share"]

    emitted.clear()
    expense.description = "Renamed"
    db.session.commit()
    assert trip_notices(emitted)[-1]["entities"] == ["expense"]

    emitted.clear()
    expense.shares[0].amount_gbp = 5
    db.session.commit()
    assert trip_notices(emitted)[-1] == {
        "trip_id": itinerary.id,
        "entities": ["expense_share"],
        "by_user_id": None,
    }

    emitted.clear()
    expense_id = expense.id
    db.session.delete(expense)
    db.session.commit()
    assert "expense" in trip_notices(emitted)[-1]["entities"]
    assert db.session.query(ExpenseShare).filter_by(expense_id=expense_id).count() == 0


def test_settlements_are_tracked(emitted, itinerary, admin_user, viewer_user):
    settlement = SettlementFactory(
        itinerary_id=itinerary.id, from_user=viewer_user, to_user=admin_user
    )
    db.session.commit()
    assert trip_notices(emitted)[-1]["entities"] == ["settlement"]

    emitted.clear()
    settlement.amount_gbp = 5
    db.session.commit()
    assert trip_notices(emitted)[-1]["entities"] == ["settlement"]

    emitted.clear()
    db.session.delete(settlement)
    db.session.commit()
    assert trip_notices(emitted)[-1]["entities"] == ["settlement"]


def test_flight_and_its_expense_are_announced_together(
    emitted, admin_client, itinerary, flight_provider
):
    emitted.clear()

    admin_client.post(
        f"/api/itineraries/{itinerary.id}/flights",
        json={
            "origin": ["LHR"],
            "destination": ["JFK"],
            "departureDate": "2099-08-01",
            "legs": [{"airline": "BA", "flightNumber": "117"}],
        },
    )

    [notice] = trip_notices(emitted)
    assert notice["entities"] == ["expense", "expense_share", "flight"]


@pytest.mark.parametrize("item", ["event", "accommodation", "flight"])
def test_deleting_an_item_announces_the_expense_it_unlinks(
    emitted, itinerary, admin_user, event, flight, item
):
    target = {"event": event, "flight": flight}.get(item)
    if item == "accommodation":
        target = Accommodation(
            itinerary_id=itinerary.id,
            name="Stay",
            address="1 Street",
            latitude=1.0,
            longitude=2.0,
            start_date=event.start_at.date(),
            end_date=event.start_at.date(),
            created_by_id=admin_user.id,
        )
        db.session.add(target)
        db.session.flush()
    expense = ExpenseFactory(
        itinerary=itinerary, paid_by=admin_user, **{f"{item}_id": target.id}
    )
    db.session.commit()
    emitted.clear()

    db.session.delete(target)
    db.session.commit()

    assert "expense" in trip_notices(emitted)[-1]["entities"]
    assert db.session.get(Expense, expense.id).__getattribute__(f"{item}_id") is None


@pytest.fixture
def heard(monkeypatch):
    listened = []
    monkeypatch.setattr("src.realtime.change_tracker._LISTENERS", [listened.append])
    return listened


def test_listeners_hear_each_changed_row_after_commit(
    emitted, heard, itinerary, admin_user
):
    event = EventFactory(itinerary=itinerary, creator=admin_user)
    db.session.flush()
    assert heard == []

    db.session.commit()

    assert heard == [[EntityChange(itinerary.id, "event", event.id, deleted=False)]]


def test_listeners_hear_deletions(emitted, heard, itinerary, admin_user):
    event = EventFactory(itinerary=itinerary, creator=admin_user)
    db.session.commit()
    heard.clear()
    event_id = event.id

    db.session.delete(event)
    db.session.commit()

    assert heard == [[EntityChange(itinerary.id, "event", event_id, deleted=True)]]


def test_a_row_changed_twice_in_one_commit_is_reported_once(
    emitted, heard, itinerary, admin_user
):
    event = EventFactory(itinerary=itinerary, creator=admin_user)
    db.session.flush()
    event.name = "Renamed"
    db.session.flush()

    db.session.commit()

    assert len(heard[0]) == 1


def test_rollback_discards_records_without_notifying(
    emitted, heard, itinerary, admin_user
):
    EventFactory(itinerary=itinerary, creator=admin_user)
    db.session.flush()
    assert RECORDS_INFO_KEY in db.session.info

    db.session.rollback()

    assert RECORDS_INFO_KEY not in db.session.info
    assert heard == []


def test_a_failing_listener_does_not_break_commit(
    monkeypatch, emitted, itinerary, admin_user
):
    def boom(_records):
        raise RuntimeError("queue down")

    monkeypatch.setattr("src.realtime.change_tracker._LISTENERS", [boom])
    EventFactory(itinerary=itinerary, creator=admin_user)

    db.session.commit()

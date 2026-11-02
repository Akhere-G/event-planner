from datetime import date
from unittest.mock import patch

import pytest
from sqlalchemy import select
from src.extensions import db
from src.models import Accommodation, Event, PackingItem, Wishlist, WishlistItem
from tests.factories import EventFactory, ItineraryFactory


@pytest.fixture
def doomed(app, itinerary):
    return EventFactory(itinerary=itinerary)


def trip_events(itinerary_id):
    return (
        db.session.execute(select(Event).where(Event.itinerary_id == itinerary_id))
        .scalars()
        .all()
    )


def apply(client, itinerary_id, ops):
    return client.post(f"/api/itineraries/{itinerary_id}/changes/apply", json={"ops": ops})


def event_data(name="Dinner", start="2026-08-21T18:00:00Z", end="2026-08-21T20:00:00Z"):
    return {
        "name": name,
        "address": "1 Rue Cler, Paris",
        "latitude": 48.85,
        "longitude": 2.30,
        "category": "Food",
        "startAt": start,
        "endAt": end,
    }


def test_apply_mixed_change_set_succeeds(
    editor_client, editor_user, itinerary, event, doomed
):
    ops = [
        {"op": "create", "entity": "event", "data": event_data()},
        {
            "op": "update",
            "entity": "event",
            "id": event.id,
            "data": {"startAt": "2026-08-20T09:00:00Z", "endAt": "2026-08-20T10:00:00Z"},
        },
        {"op": "delete", "entity": "event", "id": doomed.id},
        {"op": "create", "entity": "packing_item", "data": {"name": "Sunscreen"}},
        {"op": "create", "entity": "wishlist_item", "data": {"name": "Eiffel Tower"}},
        {
            "op": "create",
            "entity": "accommodation",
            "data": {
                "name": "Hotel Paris",
                "address": "2 Rue de Rivoli",
                "latitude": 48.86,
                "longitude": 2.34,
                "startDate": "2026-08-20",
                "endDate": "2026-08-25",
            },
        },
    ]

    response = apply(editor_client, itinerary.id, ops)

    assert response.status_code == 200
    assert response.get_json()["data"] == {"created": 4, "updated": 1, "deleted": 1}

    created = db.session.execute(select(Event).where(Event.name == "Dinner")).scalar_one()
    assert created.created_by_id == editor_user.id
    assert created.updated_by_id == editor_user.id

    db.session.refresh(event)
    assert event.start_at.hour == 9
    assert event.updated_by_id == editor_user.id
    assert db.session.get(Event, doomed.id) is None

    packing = db.session.execute(
        select(PackingItem).where(PackingItem.name == "Sunscreen")
    ).scalar_one()
    assert packing.is_shared is True
    assert packing.category == "General"

    wishlist = db.session.execute(
        select(Wishlist).where(Wishlist.itinerary_id == itinerary.id)
    ).scalar_one()
    assert wishlist.name == "AI ideas"
    item = db.session.execute(select(WishlistItem)).scalar_one()
    assert item.wishlist_id == wishlist.id

    hotel = db.session.execute(select(Accommodation)).scalar_one()
    assert hotel.start_date == date(2026, 8, 20)


def test_apply_reuses_existing_wishlist_by_name(
    editor_client, itinerary, wishlist
):
    ops = [
        {
            "op": "create",
            "entity": "wishlist_item",
            "data": {"name": "Louvre", "wishlistName": wishlist.name},
        }
    ]

    response = apply(editor_client, itinerary.id, ops)

    assert response.status_code == 200
    wishlists = db.session.execute(
        select(Wishlist).where(Wishlist.itinerary_id == itinerary.id)
    ).scalars().all()
    assert [w.id for w in wishlists] == [wishlist.id]


def test_apply_forbidden_for_viewer(viewer_client, itinerary):
    response = apply(
        viewer_client, itinerary.id, [{"op": "create", "entity": "event", "data": event_data()}]
    )
    assert response.status_code == 403
    assert trip_events(itinerary.id) == []


def test_apply_rejected_for_non_member(app, client, non_member_user, itinerary):
    with client.session_transaction() as session:
        session["user_id"] = non_member_user.id

    response = apply(
        client, itinerary.id, [{"op": "create", "entity": "event", "data": event_data()}]
    )
    assert response.status_code in (401, 403)
    assert trip_events(itinerary.id) == []


def test_apply_requires_login(client, itinerary):
    response = apply(
        client, itinerary.id, [{"op": "create", "entity": "event", "data": event_data()}]
    )
    assert response.status_code in (401, 403)


def test_apply_invalid_op_rejects_whole_set(editor_client, itinerary):
    ops = [
        {"op": "create", "entity": "event", "data": event_data("Valid")},
        {"op": "create", "entity": "event", "data": {"name": "Missing fields"}},
    ]

    response = apply(editor_client, itinerary.id, ops)

    assert response.status_code == 400
    assert trip_events(itinerary.id) == []


def test_apply_update_without_id_is_rejected(editor_client, itinerary):
    response = apply(
        editor_client,
        itinerary.id,
        [{"op": "update", "entity": "event", "data": {"name": "x"}}],
    )
    assert response.status_code == 400


def test_apply_rolls_back_and_never_commits_when_a_target_is_missing(
    editor_client, itinerary
):
    ops = [
        {"op": "create", "entity": "event", "data": event_data("Should not persist")},
        {"op": "delete", "entity": "event", "id": 999999},
    ]

    with (
        patch.object(db.session, "commit") as commit,
        patch.object(db.session, "rollback") as rollback,
    ):
        response = apply(editor_client, itinerary.id, ops)

    assert response.status_code == 404
    commit.assert_not_called()
    rollback.assert_called()


def test_apply_cannot_touch_another_trips_event(editor_client, itinerary):
    other_event = EventFactory(itinerary=ItineraryFactory())

    response = apply(
        editor_client,
        itinerary.id,
        [{"op": "delete", "entity": "event", "id": other_event.id}],
    )

    assert response.status_code == 404


def test_apply_rejects_end_before_start(editor_client, itinerary):
    ops = [
        {
            "op": "create",
            "entity": "event",
            "data": event_data(start="2026-08-21T20:00:00Z", end="2026-08-21T18:00:00Z"),
        }
    ]
    assert apply(editor_client, itinerary.id, ops).status_code == 400


def test_apply_rejects_empty_and_oversized_sets(editor_client, itinerary):
    assert apply(editor_client, itinerary.id, []).status_code == 400
    too_many = [
        {"op": "create", "entity": "packing_item", "data": {"name": f"Item {i}"}}
        for i in range(61)
    ]
    assert apply(editor_client, itinerary.id, too_many).status_code == 400

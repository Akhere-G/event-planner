from datetime import date
from unittest.mock import patch

import pytest
from marshmallow import ValidationError
from sqlalchemy import select
from src.exceptions import EventNotFoundError
from src.extensions import db
from src.models import Accommodation, Event, PackingItem, Wishlist, WishlistItem
from src.services.change_set_service import apply_change_set
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


def event_data(name="Dinner", start="2026-08-21T18:00:00Z", end="2026-08-21T20:00:00Z"):
    return {
        "name": name,
        "address": "1 Rue Cler, Paris",
        "latitude": 48.85,
        "longitude": 2.30,
        "category": "Food",
        "start_at": start,
        "end_at": end,
    }


def create_event(name="Dinner", **times):
    return {"op": "create", "entity": "event", "data": event_data(name, **times)}


def test_apply_mixed_change_set_succeeds(editor_user, itinerary, event, doomed):
    ops = [
        create_event(),
        {
            "op": "update",
            "entity": "event",
            "id": event.id,
            "data": {
                "start_at": "2026-08-20T09:00:00Z",
                "end_at": "2026-08-20T10:00:00Z",
            },
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
                "start_date": "2026-08-20",
                "end_date": "2026-08-25",
            },
        },
    ]

    counts = apply_change_set(itinerary.id, ops, editor_user.id)

    assert counts == {"created": 4, "updated": 1, "deleted": 1}

    created = db.session.execute(
        select(Event).where(Event.itinerary_id == itinerary.id, Event.name == "Dinner")
    ).scalar_one()
    assert created.created_by_id == editor_user.id
    assert created.updated_by_id == editor_user.id

    db.session.refresh(event)
    assert event.start_at.hour == 9
    assert event.updated_by_id == editor_user.id
    assert db.session.get(Event, doomed.id) is None

    packing = db.session.execute(
        select(PackingItem).where(
            PackingItem.itinerary_id == itinerary.id, PackingItem.name == "Sunscreen"
        )
    ).scalar_one()
    assert packing.is_shared is True
    assert packing.category == "General"

    wishlist = db.session.execute(
        select(Wishlist).where(Wishlist.itinerary_id == itinerary.id)
    ).scalar_one()
    assert wishlist.name == "AI ideas"
    item = db.session.execute(
        select(WishlistItem).where(WishlistItem.wishlist_id == wishlist.id)
    ).scalar_one()
    assert item.name == "Eiffel Tower"

    hotel = db.session.execute(
        select(Accommodation).where(Accommodation.itinerary_id == itinerary.id)
    ).scalar_one()
    assert hotel.start_date == date(2026, 8, 20)


def test_apply_reuses_existing_wishlist_by_name(editor_user, itinerary, wishlist):
    ops = [
        {
            "op": "create",
            "entity": "wishlist_item",
            "data": {"name": "Louvre", "wishlist_name": wishlist.name},
        }
    ]

    apply_change_set(itinerary.id, ops, editor_user.id)

    wishlists = (
        db.session.execute(
            select(Wishlist).where(Wishlist.itinerary_id == itinerary.id)
        )
        .scalars()
        .all()
    )
    assert [w.id for w in wishlists] == [wishlist.id]


def test_invalid_op_rejects_whole_set(editor_user, itinerary):
    ops = [
        create_event("Valid"),
        {"op": "create", "entity": "event", "data": {"name": "Missing fields"}},
    ]

    with pytest.raises(ValidationError):
        apply_change_set(itinerary.id, ops, editor_user.id)

    assert trip_events(itinerary.id) == []


def test_rolls_back_and_never_commits_when_a_target_is_missing(editor_user, itinerary):
    ops = [
        create_event("Should not persist"),
        {"op": "delete", "entity": "event", "id": 999999},
    ]

    with (
        patch.object(db.session, "commit") as commit,
        patch.object(db.session, "rollback") as rollback,
        pytest.raises(EventNotFoundError),
    ):
        apply_change_set(itinerary.id, ops, editor_user.id)

    commit.assert_not_called()
    rollback.assert_called()


def test_cannot_touch_another_trips_event(editor_user, itinerary):
    other_event = EventFactory(itinerary=ItineraryFactory())

    with pytest.raises(EventNotFoundError):
        apply_change_set(
            itinerary.id,
            [{"op": "delete", "entity": "event", "id": other_event.id}],
            editor_user.id,
        )


def test_rejects_end_before_start(editor_user, itinerary):
    ops = [
        create_event(start="2026-08-21T20:00:00Z", end="2026-08-21T18:00:00Z"),
    ]

    with pytest.raises(ValidationError):
        apply_change_set(itinerary.id, ops, editor_user.id)

from datetime import UTC, date, datetime

import pytest
from src.exceptions import BadRequestError
from src.extensions import db
from src.models import Accommodation, PackingItem
from src.services.template_snapshot_service import build_snapshot_ops
from tests.factories import (
    EventFactory,
    ItineraryFactory,
    WishlistFactory,
    WishlistItemFactory,
)


def ops_for(ops, entity):
    return [op["data"] for op in ops if op["entity"] == entity]


def add_packing_item(itinerary, user, **fields):
    item = PackingItem(
        itinerary_id=itinerary.id,
        category="Clothes",
        created_by_id=user.id,
        updated_by_id=user.id,
        **fields,
    )
    db.session.add(item)
    db.session.flush()
    return item


def test_events_become_day_offsets_and_local_times(itinerary, admin_user):
    EventFactory(
        itinerary=itinerary,
        creator=admin_user,
        start_at=datetime(2026, 8, 2, 10, 0, tzinfo=UTC),
        end_at=datetime(2026, 8, 2, 12, 30, tzinfo=UTC),
    )

    ops = build_snapshot_ops(itinerary)

    event = ops_for(ops, "event")[0]
    assert (event["day_offset"], event["start_time"]) == (1, "12:00")
    assert (event["end_day_offset"], event["end_time"]) == (1, "14:30")


def test_events_outside_the_trip_dates_are_dropped(itinerary, admin_user):
    EventFactory(itinerary=itinerary, creator=admin_user, name="Inside")
    EventFactory(
        itinerary=itinerary,
        creator=admin_user,
        name="Outside",
        start_at=datetime(2026, 9, 20, 10, 0, tzinfo=UTC),
        end_at=datetime(2026, 9, 20, 12, 0, tzinfo=UTC),
    )
    EventFactory(
        itinerary=itinerary,
        creator=admin_user,
        name="Inside",
        start_at=datetime(2026, 8, 1, 10, 0, tzinfo=UTC),
        end_at=datetime(2026, 8, 1, 12, 0, tzinfo=UTC),
    )

    ops = build_snapshot_ops(itinerary)

    assert [event["name"] for event in ops_for(ops, "event")] == ["Inside"]


def test_only_shared_packing_items_are_included(itinerary, admin_user):
    EventFactory(
        itinerary=itinerary,
        creator=admin_user,
        start_at=datetime(2026, 8, 1, 10, 0, tzinfo=UTC),
        end_at=datetime(2026, 8, 1, 12, 0, tzinfo=UTC),
    )
    add_packing_item(itinerary, admin_user, name="Adaptor", is_shared=True)
    add_packing_item(
        itinerary,
        admin_user,
        name="My passport",
        is_shared=False,
        owner_id=admin_user.id,
    )

    ops = build_snapshot_ops(itinerary)

    assert ops_for(ops, "packing_item") == [{"name": "Adaptor", "category": "Clothes"}]


def test_accommodations_become_day_offsets(itinerary, admin_user):
    db.session.add(
        Accommodation(
            itinerary_id=itinerary.id,
            name="Hotel",
            address="1 Rue",
            latitude=48.85,
            longitude=2.35,
            start_date=date(2026, 8, 1),
            end_date=date(2026, 8, 4),
            created_by_id=admin_user.id,
            updated_by_id=admin_user.id,
        )
    )
    db.session.flush()
    db.session.refresh(itinerary)

    stay = ops_for(build_snapshot_ops(itinerary), "accommodation")[0]

    assert (stay["start_day_offset"], stay["end_day_offset"]) == (0, 3)


def test_wishlist_items_keep_their_wishlist_name(itinerary, admin_user):
    wishlist = WishlistFactory(
        itinerary=itinerary, creator=admin_user, name="Hidden gems"
    )
    WishlistItemFactory(wishlist=wishlist, creator=admin_user, name="Secret bar")
    db.session.refresh(itinerary)

    item = ops_for(build_snapshot_ops(itinerary), "wishlist_item")[0]

    assert (item["name"], item["wishlist_name"]) == ("Secret bar", "Hidden gems")


def test_snapshot_never_contains_people_or_money(itinerary, admin_user):
    EventFactory(
        itinerary=itinerary,
        creator=admin_user,
        start_at=datetime(2026, 8, 1, 10, 0, tzinfo=UTC),
        end_at=datetime(2026, 8, 1, 12, 0, tzinfo=UTC),
    )

    ops = build_snapshot_ops(itinerary)

    assert {op["entity"] for op in ops} == {"event"}
    assert "expense" not in str(ops)
    assert admin_user.email not in str(ops)


def test_empty_trip_cannot_be_published(app):
    empty = ItineraryFactory()

    with pytest.raises(BadRequestError):
        build_snapshot_ops(empty)

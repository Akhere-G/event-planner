import pytest
from datetime import date

from marshmallow import ValidationError
from src.exceptions import BadRequestError, UserNotAuthorisedError
from src.services.change_set_appliers import (
    AccommodationChangeSetApplier,
    ChangeSetApplierFactory,
    EventChangeSetApplier,
    PackingItemChangeSetApplier,
    TripChangeSetApplier,
    WishlistItemChangeSetApplier,
)


@pytest.mark.parametrize(
    "entity, expected",
    [
        ("event", EventChangeSetApplier),
        ("accommodation", AccommodationChangeSetApplier),
        ("packing_item", PackingItemChangeSetApplier),
        ("wishlist_item", WishlistItemChangeSetApplier),
        ("trip", TripChangeSetApplier),
    ],
)
def test_factory_builds_the_applier_for_each_entity(entity, expected):
    applier = ChangeSetApplierFactory.create(entity, 1, 2)
    assert isinstance(applier, expected)
    assert (applier.itinerary_id, applier.user_id) == (1, 2)


def test_factory_hands_the_role_to_the_applier():
    applier = ChangeSetApplierFactory.create("event", 1, 2, "editor")

    assert applier.role == "editor"


def test_the_role_is_unknown_unless_given():
    assert ChangeSetApplierFactory.create("event", 1, 2).role is None


def test_factory_rejects_unknown_entity():
    with pytest.raises(ValueError):
        ChangeSetApplierFactory.create("flight", 1, 2)


def test_packing_item_create_applies_defaults():
    applier = ChangeSetApplierFactory.create("packing_item", 1, 2)
    prepared = applier.prepare({"op": "create", "data": {"name": "Passport"}})
    assert prepared.data["is_shared"] is True
    assert prepared.data["category"] == "General"


def test_wishlist_item_prepare_splits_out_wishlist_name():
    applier = ChangeSetApplierFactory.create("wishlist_item", 1, 2)
    prepared = applier.prepare(
        {"op": "create", "data": {"name": "Louvre", "wishlistName": "Museums"}}
    )
    assert prepared.context == {"wishlist_name": "Museums"}
    assert "wishlist_name" not in prepared.data


def test_delete_does_not_validate_data():
    applier = ChangeSetApplierFactory.create("event", 1, 2)
    prepared = applier.prepare({"op": "delete", "id": 5})
    assert (prepared.kind, prepared.entity_id, prepared.data) == ("delete", 5, {})


def test_update_is_partial_but_still_validated():
    applier = ChangeSetApplierFactory.create("event", 1, 2)
    assert applier.prepare({"op": "update", "id": 1, "data": {"name": "New"}}).data
    with pytest.raises(ValidationError):
        applier.prepare({"op": "update", "id": 1, "data": {"latitude": "north"}})


def test_preview_of_an_update_dumps_only_the_changed_fields():
    applier = ChangeSetApplierFactory.create("event", 1, 2)
    prepared = applier.prepare(
        {
            "op": "update",
            "id": 1,
            "data": {
                "start_at": "2026-08-02T17:00:00Z",
                "end_at": "2026-08-02T19:00:00Z",
            },
        }
    )
    assert applier.preview(prepared) == {
        "start_at": "2026-08-02T17:00:00Z",
        "end_at": "2026-08-02T19:00:00Z",
    }


def test_preview_of_a_delete_is_empty():
    applier = ChangeSetApplierFactory.create("event", 1, 2)
    assert applier.preview(applier.prepare({"op": "delete", "id": 5})) == {}


def test_wishlist_create_preview_keeps_the_wishlist_name():
    applier = ChangeSetApplierFactory.create("wishlist_item", 1, 2)
    prepared = applier.prepare(
        {"op": "create", "data": {"name": "Louvre", "wishlist_name": "Museums"}}
    )
    assert applier.preview(prepared)["wishlist_name"] == "Museums"


def test_other_entity_previews_have_no_wishlist_name():
    applier = ChangeSetApplierFactory.create("packing_item", 1, 2)
    prepared = applier.prepare({"op": "create", "data": {"name": "Passport"}})
    assert "wishlist_name" not in applier.preview(prepared)


def trip_applier(itinerary, admin_user, role="admin"):
    return ChangeSetApplierFactory.create("trip", itinerary.id, admin_user.id, role)


def test_a_trip_op_only_accepts_dates_and_budget(itinerary, admin_user):
    applier = trip_applier(itinerary, admin_user)

    prepared = applier.prepare(
        {
            "op": "update",
            "id": itinerary.id,
            "data": {"start_date": "2026-09-01", "budget_amount_gbp": 900},
        }
    )
    assert prepared.data == {"start_date": date(2026, 9, 1), "budget_amount_gbp": 900}
    with pytest.raises(ValidationError):
        applier.prepare(
            {"op": "update", "id": itinerary.id, "data": {"destination": "Rome"}}
        )


def test_a_trip_preview_shows_the_changed_fields(itinerary, admin_user):
    applier = trip_applier(itinerary, admin_user)
    prepared = applier.prepare(
        {"op": "update", "id": itinerary.id, "data": {"end_date": "2026-09-09"}}
    )

    assert applier.preview(prepared) == {"end_date": "2026-09-09"}


def test_an_admin_can_apply_a_trip_update(itinerary, admin_user):
    applier = trip_applier(itinerary, admin_user)
    prepared = applier.prepare(
        {"op": "update", "id": itinerary.id, "data": {"budget_amount_gbp": 750}}
    )

    applier.apply(prepared)

    assert itinerary.budget_amount_gbp == 750
    assert itinerary.updated_by_id == admin_user.id


@pytest.mark.parametrize("role", ["editor", "viewer", None])
def test_only_an_admin_can_apply_a_trip_update(itinerary, admin_user, role):
    applier = trip_applier(itinerary, admin_user, role)
    prepared = applier.prepare(
        {"op": "update", "id": itinerary.id, "data": {"budget_amount_gbp": 750}}
    )

    with pytest.raises(UserNotAuthorisedError):
        applier.apply(prepared)


def test_a_trip_cannot_be_added_or_removed(itinerary, admin_user):
    applier = trip_applier(itinerary, admin_user)

    with pytest.raises(BadRequestError):
        applier.apply(applier.prepare({"op": "delete", "id": itinerary.id}))
    with pytest.raises(BadRequestError):
        applier.create({}, {})

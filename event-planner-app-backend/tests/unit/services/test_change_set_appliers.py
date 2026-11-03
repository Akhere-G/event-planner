import pytest
from marshmallow import ValidationError
from src.services.change_set_appliers import (
    AccommodationChangeSetApplier,
    ChangeSetApplierFactory,
    EventChangeSetApplier,
    PackingItemChangeSetApplier,
    WishlistItemChangeSetApplier,
)


@pytest.mark.parametrize(
    "entity, expected",
    [
        ("event", EventChangeSetApplier),
        ("accommodation", AccommodationChangeSetApplier),
        ("packing_item", PackingItemChangeSetApplier),
        ("wishlist_item", WishlistItemChangeSetApplier),
    ],
)
def test_factory_builds_the_applier_for_each_entity(entity, expected):
    applier = ChangeSetApplierFactory.create(entity, 1, 2)
    assert isinstance(applier, expected)
    assert (applier.itinerary_id, applier.user_id) == (1, 2)


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

import pytest
from sqlalchemy import select
from datetime import date

from marshmallow import ValidationError
from tests.factories import ExpenseFactory
from src.exceptions import BadRequestError, UserNotAuthorisedError
from src.extensions import db
from src.models import Expense, Settlement, Wishlist
from src.services.change_set_appliers import (
    AccommodationChangeSetApplier,
    ChangeSetApplierFactory,
    EventChangeSetApplier,
    ExpenseChangeSetApplier,
    PackingItemChangeSetApplier,
    SettlementChangeSetApplier,
    TripChangeSetApplier,
    WishlistChangeSetApplier,
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
        ("wishlist", WishlistChangeSetApplier),
        ("expense", ExpenseChangeSetApplier),
        ("settlement", SettlementChangeSetApplier),
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


def wishlist_applier(wishlist, admin_user):
    return ChangeSetApplierFactory.create(
        "wishlist", wishlist.itinerary_id, admin_user.id, "admin"
    )


def test_a_wishlist_can_be_added_renamed_and_removed(wishlist, admin_user):
    applier = wishlist_applier(wishlist, admin_user)

    applier.apply(applier.prepare({"op": "create", "data": {"name": "Cafes"}}))
    applier.apply(
        applier.prepare(
            {"op": "update", "id": wishlist.id, "data": {"name": "Museums"}}
        )
    )
    applier.apply(applier.prepare({"op": "delete", "id": wishlist.id}))

    names = []
    for saved in db.session.scalars(
        select(Wishlist).where(Wishlist.itinerary_id == wishlist.itinerary_id)
    ):
        names.append(saved.name)
    assert "Cafes" in names
    assert "Museums" not in names


def test_a_wishlist_needs_a_name(wishlist, admin_user):
    with pytest.raises(ValidationError):
        wishlist_applier(wishlist, admin_user).prepare(
            {"op": "create", "data": {"name": None}}
        )


def money_applier(entity, itinerary, user, role="admin"):
    return ChangeSetApplierFactory.create(entity, itinerary.id, user.id, role)


def test_an_expense_is_added_changed_and_removed(
    itinerary, admin_user, admin_itinerary_user
):
    applier = money_applier("expense", itinerary, admin_user)

    applier.apply(
        applier.prepare(
            {
                "op": "create",
                "data": {
                    "description": "Taxi",
                    "amount": 20,
                    "spent_on": "2026-08-01",
                },
            }
        )
    )
    expense = db.session.scalars(
        select(Expense).where(Expense.itinerary_id == itinerary.id)
    ).one()
    assert expense.paid_by_id == admin_user.id

    applier.apply(
        applier.prepare({"op": "update", "id": expense.id, "data": {"amount": 25}})
    )
    assert expense.amount_gbp == 25
    applier.apply(applier.prepare({"op": "delete", "id": expense.id}))
    assert expense not in db.session


def test_an_expense_preview_lists_who_it_is_split_between(itinerary, admin_user):
    applier = money_applier("expense", itinerary, admin_user)
    prepared = applier.prepare(
        {
            "op": "update",
            "id": 1,
            "data": {"split_type": "selected", "participant_ids": [3, 4]},
        }
    )

    assert applier.preview(prepared) == {
        "split_type": "selected",
        "participant_ids": [3, 4],
    }


def test_an_expense_needs_a_description_amount_and_date(itinerary, admin_user):
    applier = money_applier("expense", itinerary, admin_user)

    with pytest.raises(ValidationError):
        applier.prepare({"op": "create", "data": {"description": "Taxi"}})


def test_an_editor_cannot_apply_a_change_to_an_admins_expense(
    itinerary, admin_user, admin_itinerary_user, editor_user, editor_itinerary_user
):
    expense = ExpenseFactory(itinerary=itinerary, paid_by=admin_user)
    applier = money_applier("expense", itinerary, editor_user, "editor")

    with pytest.raises(UserNotAuthorisedError):
        applier.apply(
            applier.prepare({"op": "update", "id": expense.id, "data": {"amount": 1}})
        )


def test_a_settlement_is_added_changed_and_removed(
    itinerary, admin_user, admin_itinerary_user, editor_user, editor_itinerary_user
):
    applier = money_applier("settlement", itinerary, admin_user)

    applier.apply(
        applier.prepare(
            {
                "op": "create",
                "data": {
                    "from_user_id": editor_user.id,
                    "to_user_id": admin_user.id,
                    "amount_gbp": 8,
                    "settled_on": "2026-08-04",
                },
            }
        )
    )
    settlement = db.session.scalars(
        select(Settlement).where(Settlement.itinerary_id == itinerary.id)
    ).one()
    applier.apply(
        applier.prepare(
            {"op": "update", "id": settlement.id, "data": {"amount_gbp": 9}}
        )
    )
    assert settlement.amount_gbp == 9
    applier.apply(applier.prepare({"op": "delete", "id": settlement.id}))
    assert settlement not in db.session

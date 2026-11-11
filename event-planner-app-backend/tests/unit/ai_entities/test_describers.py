from datetime import date
from decimal import Decimal

import pytest
from src.ai_entities.context import Requester
from src.ai_entities.describers.base import prompt_lines
from src.ai_entities.describers.factory import EntityDescriberFactory
from src.extensions import db
from src.models import Accommodation, PackingItem
from tests.factories import (
    ExpenseFactory,
    ExpenseShareFactory,
    SettlementFactory,
    WishlistItemFactory,
)


@pytest.fixture
def members(admin_user, admin_itinerary_user, editor_user, editor_itinerary_user):
    return {admin_user.id: admin_user.username, editor_user.id: editor_user.username}


def describe(entity, itinerary, user=None, role="editor", members=None):
    requester = Requester(user.id if user else None, role, members or {})
    return EntityDescriberFactory.create(entity).describe(itinerary, requester)


def test_an_unknown_entity_cannot_be_described(itinerary):
    with pytest.raises(ValueError, match="Unsupported entity"):
        EntityDescriberFactory.create("flight")


def test_an_event_is_described_in_trip_local_time_with_its_place(itinerary, event):
    descriptions = describe("event", itinerary)

    assert prompt_lines(descriptions) == [
        f"- id={event.id} | {event.name} | 2026-08-20T12:00 to 2026-08-20T14:00 | "
        f"{event.address} | {event.category}"
    ]
    assert descriptions[event.id].values == {
        "address": event.address,
        "latitude": event.latitude,
        "longitude": event.longitude,
    }


def test_an_accommodation_is_described_by_its_dates_and_place(
    itinerary, admin_user, admin_itinerary_user
):
    accommodation = Accommodation(
        itinerary_id=itinerary.id,
        name="Hotel Paris",
        address="1 Rue Cler, Paris",
        latitude=48.85,
        longitude=2.30,
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 3),
        created_by_id=admin_user.id,
        updated_by_id=admin_user.id,
    )
    db.session.add(accommodation)
    db.session.flush()

    description = describe("accommodation", itinerary)[accommodation.id]

    assert description.label == accommodation.name
    assert description.summary.endswith(accommodation.address)
    assert description.values["start_date"] == accommodation.start_date.isoformat()


def test_personal_packing_items_are_only_described_to_their_owner(
    itinerary, admin_user, editor_user
):
    shared = PackingItem(
        itinerary_id=itinerary.id, name="Tent", category="Camp", is_shared=True
    )
    mine = PackingItem(
        itinerary_id=itinerary.id,
        name="Hat",
        category="Clothes",
        is_shared=False,
        owner_id=editor_user.id,
    )
    theirs = PackingItem(
        itinerary_id=itinerary.id,
        name="Book",
        category="Misc",
        is_shared=False,
        owner_id=admin_user.id,
    )
    db.session.add_all([shared, mine, theirs])
    db.session.flush()

    descriptions = describe("packing_item", itinerary, editor_user)

    assert set(descriptions) == {shared.id, mine.id}
    assert descriptions[mine.id].summary == "Clothes | personal"


def test_a_wishlist_and_its_items_are_described(itinerary, wishlist):
    item = WishlistItemFactory(wishlist=wishlist)
    WishlistItemFactory(wishlist=wishlist)

    lists = describe("wishlist", itinerary)
    items = describe("wishlist_item", itinerary)

    assert prompt_lines(lists) == [f"- id={wishlist.id} | {wishlist.name} | 2 items"]
    assert items[item.id].summary == f"list: {wishlist.name}"


def test_the_trip_is_described_by_its_dates_and_budget(itinerary):
    itinerary.budget_amount_gbp = Decimal("1200.00")

    assert prompt_lines(describe("trip", itinerary)) == [
        f"- id={itinerary.id} | Trip dates and budget | start_date 2026-08-01 | "
        "end_date 2026-08-03 | budget_amount_gbp 1200.00"
    ]


def test_a_trip_without_a_budget_says_so(itinerary):
    itinerary.budget_amount_gbp = None

    assert "budget_amount_gbp none" in describe("trip", itinerary)[itinerary.id].summary


def test_an_expense_is_described_with_its_payer_and_shares(
    itinerary, admin_user, editor_user, members
):
    expense = ExpenseFactory(
        itinerary=itinerary,
        paid_by=admin_user,
        description="Lunch",
        amount=Decimal("20.00"),
        currency="EUR",
        spent_on=date(2026, 8, 2),
    )
    ExpenseShareFactory(expense=expense, user=admin_user, amount_gbp=Decimal("10.00"))
    ExpenseShareFactory(expense=expense, user=editor_user, amount_gbp=Decimal("10.00"))

    descriptions = describe("expense", itinerary, admin_user, "admin", members)

    assert prompt_lines(descriptions) == [
        f"- id={expense.id} | Lunch | 20.00 EUR | other | 2026-08-02 | "
        f"paid_by_id {admin_user.id} ({admin_user.username}) | split_type even_all | "
        f"shares: {admin_user.id} ({admin_user.username}) £10.00, "
        f"{editor_user.id} ({editor_user.username}) £10.00"
    ]
    assert descriptions[expense.id].values == {"paid_by_id": admin_user.id}


def test_an_editor_only_sees_the_expenses_and_payments_they_added(
    itinerary, admin_user, editor_user, members
):
    mine = ExpenseFactory(itinerary=itinerary, paid_by=editor_user)
    ExpenseFactory(itinerary=itinerary, paid_by=admin_user)

    as_editor = describe("expense", itinerary, editor_user, "editor", members)
    as_admin = describe("expense", itinerary, admin_user, "admin", members)

    assert set(as_editor) == {mine.id}
    assert len(as_admin) == 2


def test_a_settlement_is_described_by_who_paid_whom(
    itinerary, admin_user, editor_user, members
):
    settlement = SettlementFactory(
        itinerary_id=itinerary.id,
        from_user=admin_user,
        to_user=editor_user,
        amount_gbp=Decimal("7.50"),
        settled_on=date(2026, 8, 3),
    )

    descriptions = describe("settlement", itinerary, admin_user, "admin", members)

    assert prompt_lines(descriptions) == [
        f"- id={settlement.id} | {admin_user.username} paid {editor_user.username} "
        f"£7.50 | from_user_id {admin_user.id} ({admin_user.username}) | "
        f"to_user_id {editor_user.id} ({editor_user.username}) | 2026-08-03"
    ]
    assert descriptions[settlement.id].values == {
        "from_user_id": admin_user.id,
        "to_user_id": editor_user.id,
    }

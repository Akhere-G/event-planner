from datetime import date
from decimal import Decimal

import pytest
from src.services.trip_edit.money_editors import ExpenseEditor, SettlementEditor
from tests.factories import (
    ExpenseFactory,
    ExpenseShareFactory,
    SettlementFactory,
    edit_context,
)


@pytest.fixture
def members(admin_user, admin_itinerary_user, editor_user, editor_itinerary_user):
    return {admin_user.id: admin_user.username, editor_user.id: editor_user.username}


def expense_editor(itinerary, user, role, members):
    context = edit_context(itinerary, user_id=user.id, role=role, members=members)
    return ExpenseEditor(context)


def settlement_editor(itinerary, user, role, members):
    context = edit_context(itinerary, user_id=user.id, role=role, members=members)
    return SettlementEditor(context)


def test_the_money_editors_need_a_signed_in_user(itinerary):
    anonymous = edit_context(itinerary, user_id=None)

    assert not ExpenseEditor.is_available(anonymous)
    assert not SettlementEditor.is_available(anonymous)
    assert ExpenseEditor.is_available(edit_context(itinerary, user_id=3))


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

    lines = expense_editor(itinerary, admin_user, "admin", members).lines()

    assert lines == [
        f"- id={expense.id} | Lunch | 20.00 EUR | other | 2026-08-02 | "
        f"paid_by_id {admin_user.id} ({admin_user.username}) | split_type even_all | "
        f"shares: {admin_user.id} ({admin_user.username}) £10.00, "
        f"{editor_user.id} ({editor_user.username}) £10.00"
    ]


def test_an_editor_only_sees_the_expenses_they_added(
    itinerary, admin_user, editor_user, members
):
    mine = ExpenseFactory(itinerary=itinerary, paid_by=editor_user)
    ExpenseFactory(itinerary=itinerary, paid_by=admin_user)

    editor = expense_editor(itinerary, editor_user, "editor", members)

    assert editor.ids() == {mine.id}
    assert expense_editor(itinerary, admin_user, "admin", members).ids() != {mine.id}


def test_an_admin_can_name_anyone_as_payer_but_an_editor_only_themselves(
    itinerary, admin_user, editor_user, members
):
    as_admin = expense_editor(itinerary, admin_user, "admin", members)
    as_editor = expense_editor(itinerary, editor_user, "editor", members)
    data = {"description": "Taxi", "paid_by_id": admin_user.id}

    assert as_admin.normalise("create", None, {**data, "paid_by_id": editor_user.id})
    assert as_editor.normalise("create", None, {**data, "paid_by_id": editor_user.id})
    assert as_editor.normalise("create", None, data) is None


def test_an_editor_may_keep_the_payer_an_expense_already_has(
    itinerary, admin_user, editor_user, members
):
    expense = ExpenseFactory(
        itinerary=itinerary, paid_by=admin_user, created_by_id=editor_user.id
    )
    editor = expense_editor(itinerary, editor_user, "editor", members)

    kept = editor.normalise("update", expense.id, {"paid_by_id": admin_user.id})

    assert kept == {"paid_by_id": admin_user.id}


@pytest.mark.parametrize("payer", [999999, None, True, "1"])
def test_a_payer_who_is_not_a_member_is_rejected(itinerary, admin_user, members, payer):
    editor = expense_editor(itinerary, admin_user, "admin", members)

    assert editor.normalise("create", None, {"paid_by_id": payer}) is None


def test_the_people_an_expense_is_split_between_must_be_members(
    itinerary, admin_user, editor_user, members
):
    editor = expense_editor(itinerary, admin_user, "admin", members)
    both = [admin_user.id, editor_user.id]

    assert editor.normalise("update", 1, {"participant_ids": both})
    assert editor.normalise("update", 1, {"participant_ids": []}) is None
    assert editor.normalise("update", 1, {"participant_ids": [999999]}) is None
    assert editor.normalise("update", 1, {"participant_ids": "everyone"}) is None


def test_a_new_selected_split_needs_people(itinerary, admin_user, members):
    editor = expense_editor(itinerary, admin_user, "admin", members)
    selected = {"description": "Taxi", "split_type": "selected"}

    assert editor.normalise("create", None, selected) is None
    assert editor.normalise(
        "create", None, {**selected, "participant_ids": [admin_user.id]}
    )
    assert editor.normalise("create", None, {"description": "Taxi"})


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

    lines = settlement_editor(itinerary, admin_user, "admin", members).lines()

    assert lines == [
        f"- id={settlement.id} | {admin_user.username} paid {editor_user.username} "
        f"£7.50 | from_user_id {admin_user.id} ({admin_user.username}) | "
        f"to_user_id {editor_user.id} ({editor_user.username}) | 2026-08-03"
    ]


def test_a_settlement_needs_two_different_members(
    itinerary, admin_user, editor_user, members
):
    editor = settlement_editor(itinerary, admin_user, "admin", members)
    pair = {"from_user_id": admin_user.id, "to_user_id": editor_user.id}

    assert editor.normalise("create", None, pair)
    same = {"from_user_id": admin_user.id, "to_user_id": admin_user.id}
    assert editor.normalise("create", None, same) is None
    stranger = {"from_user_id": admin_user.id, "to_user_id": 999999}
    assert editor.normalise("create", None, stranger) is None


def test_changing_one_side_of_a_settlement_cannot_make_it_a_loop(
    itinerary, admin_user, editor_user, members
):
    settlement = SettlementFactory(
        itinerary_id=itinerary.id, from_user=admin_user, to_user=editor_user
    )
    editor = settlement_editor(itinerary, admin_user, "admin", members)

    assert (
        editor.normalise("update", settlement.id, {"to_user_id": admin_user.id}) is None
    )
    assert editor.normalise("update", settlement.id, {"amount_gbp": 3})


def test_an_editor_can_only_record_their_own_payments(
    itinerary, admin_user, editor_user, members
):
    editor = settlement_editor(itinerary, editor_user, "editor", members)
    theirs = {"from_user_id": editor_user.id, "to_user_id": admin_user.id}
    someone_elses = {"from_user_id": admin_user.id, "to_user_id": editor_user.id}

    assert editor.normalise("create", None, theirs)
    assert editor.normalise("create", None, someone_elses) is None

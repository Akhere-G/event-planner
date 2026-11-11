from datetime import date
from decimal import Decimal
from types import SimpleNamespace

import pytest
from src.exceptions import BadRequestError, UserNotAuthorisedError
from src.extensions import db
from src.services.expense_service import (
    compute_net_balances,
    compute_shares,
    simplify_debts,
    stage_create_expense_as_member,
    stage_create_settlement,
    stage_delete_expense,
    stage_delete_settlement,
    stage_update_expense,
    stage_update_settlement,
)
from tests.factories import ExpenseFactory, SettlementFactory

D = Decimal


def expense(payer, amount, shares):
    return SimpleNamespace(
        paid_by_id=payer,
        amount_gbp=D(amount),
        shares=[SimpleNamespace(user_id=u, amount_gbp=D(a)) for u, a in shares.items()],
    )


def test_even_split_exact():
    assert compute_shares(D("30.00"), 1, [1, 2, 3]) == {
        1: D("10.00"),
        2: D("10.00"),
        3: D("10.00"),
    }


def test_remainder_goes_to_payer():
    shares = compute_shares(D("10.00"), 2, [1, 2, 3])
    assert shares == {1: D("3.33"), 2: D("3.34"), 3: D("3.33")}
    assert sum(shares.values()) == D("10.00")


def test_remainder_when_payer_not_participant():
    shares = compute_shares(D("10.00"), 9, [1, 2, 3])
    assert shares[9] == D("0.01")
    assert sum(shares.values()) == D("10.00")


def test_self_split_is_all_payer():
    assert compute_shares(D("12.50"), 1, [1]) == {1: D("12.50")}


def test_no_participants_rejected():
    with pytest.raises(BadRequestError):
        compute_shares(D("5"), 1, [])


def test_net_balances_with_settlement():
    expenses = [expense(1, "30.00", {1: "10.00", 2: "10.00", 3: "10.00"})]
    settlements = [
        SimpleNamespace(from_user_id=2, to_user_id=1, amount_gbp=D("10.00"))
    ]
    net = compute_net_balances(expenses, settlements)
    assert net == {1: D("10.00"), 2: D("0.00"), 3: D("-10.00")}


def test_simplify_debts_greedy():
    net = {1: D("20.00"), 2: D("-5.00"), 3: D("-15.00")}
    transfers = simplify_debts(net)
    assert transfers == [
        {"from_user_id": 3, "to_user_id": 1, "amount_gbp": D("15.00")},
        {"from_user_id": 2, "to_user_id": 1, "amount_gbp": D("5.00")},
    ]


def test_simplify_debts_chain_reduces_transfers():
    # A paid for B, B paid for C: net result is C owes A only.
    net = compute_net_balances(
        [
            expense(1, "10", {2: "10"}),
            expense(2, "10", {3: "10"}),
        ],
        [],
    )
    assert simplify_debts(net) == [
        {"from_user_id": 3, "to_user_id": 1, "amount_gbp": D("10")}
    ]


def test_simplify_empty_when_settled():
    assert simplify_debts({1: D("0"), 2: D("0")}) == []


def new_expense(itinerary, payer, **fields):
    data = {"description": "Taxi", "amount": 30, "spent_on": date(2026, 8, 1)}
    return stage_create_expense_as_member(
        payer.id, "editor", itinerary.id, {**data, **fields}
    )


def test_an_editor_can_stage_an_expense_they_pay(
    itinerary, editor_user, editor_itinerary_user
):
    expense = new_expense(itinerary, editor_user)

    assert expense.paid_by_id == editor_user.id
    assert len(expense.shares) == 1
    assert expense.shares[0].user_id == editor_user.id


def test_only_an_admin_can_name_someone_else_as_payer(
    itinerary, admin_user, admin_itinerary_user, editor_user, editor_itinerary_user
):
    with pytest.raises(UserNotAuthorisedError):
        new_expense(itinerary, editor_user, paid_by_id=admin_user.id)

    expense = stage_create_expense_as_member(
        admin_user.id,
        "admin",
        itinerary.id,
        {
            "description": "Taxi",
            "amount": 30,
            "spent_on": date(2026, 8, 1),
            "paid_by_id": editor_user.id,
        },
    )
    assert expense.paid_by_id == editor_user.id


def test_staging_an_expense_update_recalculates_the_shares(
    itinerary, editor_user, editor_itinerary_user, admin_user, admin_itinerary_user
):
    expense = new_expense(itinerary, editor_user)

    stage_update_expense(
        editor_user.id,
        "editor",
        itinerary.id,
        expense.id,
        {"amount": 60, "split_type": "selected", "participant_ids": [admin_user.id]},
    )

    assert expense.amount_gbp == D("60.00")
    assert len(expense.shares) == 1
    assert expense.shares[0].user_id == admin_user.id
    assert expense.shares[0].amount_gbp == D("60.00")


def test_only_the_owner_or_an_admin_can_stage_an_expense_change(
    itinerary, admin_user, admin_itinerary_user, editor_user, editor_itinerary_user
):
    expense = ExpenseFactory(itinerary=itinerary, paid_by=admin_user)

    with pytest.raises(UserNotAuthorisedError):
        stage_update_expense(
            editor_user.id, "editor", itinerary.id, expense.id, {"amount": 5}
        )
    with pytest.raises(UserNotAuthorisedError):
        stage_delete_expense(editor_user.id, "editor", itinerary.id, expense.id)


def test_staging_an_expense_delete_removes_it_from_the_session(
    itinerary, admin_user, admin_itinerary_user
):
    expense = ExpenseFactory(itinerary=itinerary, paid_by=admin_user)

    stage_delete_expense(admin_user.id, "admin", itinerary.id, expense.id)

    assert expense not in db.session


def test_a_settlement_is_staged_between_two_members(
    itinerary, admin_user, admin_itinerary_user, editor_user, editor_itinerary_user
):
    settlement = stage_create_settlement(
        editor_user.id,
        "editor",
        itinerary.id,
        {
            "from_user_id": editor_user.id,
            "to_user_id": admin_user.id,
            "amount_gbp": 12.5,
            "settled_on": date(2026, 8, 3),
        },
    )

    assert settlement.id is not None
    assert settlement.amount_gbp == D("12.50")


def test_a_settlement_needs_two_different_people(
    itinerary, editor_user, editor_itinerary_user
):
    with pytest.raises(BadRequestError):
        stage_create_settlement(
            editor_user.id,
            "editor",
            itinerary.id,
            {
                "from_user_id": editor_user.id,
                "to_user_id": editor_user.id,
                "amount_gbp": 5,
                "settled_on": date(2026, 8, 3),
            },
        )


def test_staging_a_settlement_update_and_delete_follow_the_owner_rule(
    itinerary, admin_user, admin_itinerary_user, editor_user, editor_itinerary_user
):
    settlement = SettlementFactory(
        itinerary_id=itinerary.id, from_user=admin_user, to_user=editor_user
    )

    with pytest.raises(UserNotAuthorisedError):
        stage_update_settlement(
            editor_user.id, "editor", itinerary.id, settlement.id, {"amount_gbp": 1}
        )
    with pytest.raises(UserNotAuthorisedError):
        stage_delete_settlement(editor_user.id, "editor", itinerary.id, settlement.id)

    stage_update_settlement(
        admin_user.id, "admin", itinerary.id, settlement.id, {"amount_gbp": 1}
    )
    assert settlement.amount_gbp == D("1.00")
    stage_delete_settlement(admin_user.id, "admin", itinerary.id, settlement.id)
    assert settlement not in db.session

from decimal import Decimal
from types import SimpleNamespace

import pytest
from src.exceptions import BadRequestError
from src.services.expense_service import (
    compute_net_balances,
    compute_shares,
    simplify_debts,
)

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

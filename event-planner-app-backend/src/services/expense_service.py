from collections import defaultdict
from decimal import ROUND_HALF_UP, Decimal
from typing import Iterable

from sqlalchemy import select

from ..exceptions import BadRequestError, NotFoundError, UserNotAuthorisedError
from ..extensions import db
from . import fx_service
from ..models import (
    Accommodation,
    Event,
    Expense,
    ExpenseShare,
    ItineraryUser,
    Settlement,
    SplitType,
    User,
    UserRole,
)

CENT = Decimal("0.01")


def to_money(value) -> Decimal:
    return Decimal(str(value)).quantize(CENT, rounding=ROUND_HALF_UP)


def compute_shares(
    amount: Decimal, payer_id: int, participant_ids: Iterable[int]
) -> dict[int, Decimal]:
    """Split ``amount`` evenly in whole pence; the rounding remainder goes to the payer."""
    amount = to_money(amount)
    participants = list(dict.fromkeys(participant_ids))
    if not participants:
        raise BadRequestError("An expense must be split between at least one person.")

    total_pence = int(amount / CENT)
    base, remainder = divmod(total_pence, len(participants))
    shares = {user_id: Decimal(base) * CENT for user_id in participants}
    if remainder:
        shares[payer_id] = shares.get(payer_id, Decimal("0")) + Decimal(remainder) * CENT
    return shares


def compute_net_balances(
    expenses: Iterable[Expense], settlements: Iterable[Settlement]
) -> dict[int, Decimal]:
    """Positive = is owed money, negative = owes money."""
    net: dict[int, Decimal] = defaultdict(lambda: Decimal("0"))
    for expense in expenses:
        net[expense.paid_by_id] += expense.amount_gbp
        for share in expense.shares:
            net[share.user_id] -= share.amount_gbp
    for settlement in settlements:
        net[settlement.from_user_id] += settlement.amount_gbp
        net[settlement.to_user_id] -= settlement.amount_gbp
    return dict(net)


def simplify_debts(net: dict[int, Decimal]) -> list[dict]:
    """Greedy matching: the biggest debtor pays the biggest creditor."""
    debtors = sorted(
        ([u, -b] for u, b in net.items() if b < 0), key=lambda x: (-x[1], x[0])
    )
    creditors = sorted(
        ([u, b] for u, b in net.items() if b > 0), key=lambda x: (-x[1], x[0])
    )
    transfers: list[dict] = []
    i = j = 0
    while i < len(debtors) and j < len(creditors):
        pay = min(debtors[i][1], creditors[j][1])
        if pay > 0:
            transfers.append(
                {
                    "from_user_id": debtors[i][0],
                    "to_user_id": creditors[j][0],
                    "amount_gbp": pay,
                }
            )
        debtors[i][1] -= pay
        creditors[j][1] -= pay
        if debtors[i][1] == 0:
            i += 1
        if creditors[j][1] == 0:
            j += 1
    return transfers


def get_member_ids(itinerary_id: int) -> list[int]:
    stmt = select(ItineraryUser.user_id).where(
        ItineraryUser.itinerary_id == itinerary_id
    )
    return list(db.session.execute(stmt).scalars().all())


def _require_members(itinerary_id: int, user_ids: Iterable[int]):
    members = set(get_member_ids(itinerary_id))
    if not set(user_ids) <= members:
        raise BadRequestError("Everyone on an expense must be a member of the trip.")


def _require_user(user_id: int | None) -> int:
    if user_id is None:
        raise BadRequestError("You must be signed in to manage expenses.")
    return user_id


def _validate_links(itinerary_id: int, data: dict):
    event_id = data.get("event_id")
    accommodation_id = data.get("accommodation_id")
    if event_id and accommodation_id:
        raise BadRequestError("An expense can link to an event or an accommodation, not both.")
    if event_id:
        found = db.session.execute(
            select(Event.id).where(
                Event.id == event_id, Event.itinerary_id == itinerary_id
            )
        ).scalar_one_or_none()
        if not found:
            raise BadRequestError("That event is not part of this trip.")
    if accommodation_id:
        found = db.session.execute(
            select(Accommodation.id).where(
                Accommodation.id == accommodation_id,
                Accommodation.itinerary_id == itinerary_id,
            )
        ).scalar_one_or_none()
        if not found:
            raise BadRequestError("That accommodation is not part of this trip.")


def _participants(itinerary_id: int, split_type: str, payer_id: int, data: dict):
    if split_type == SplitType.SELF.value:
        return [payer_id]
    if split_type == SplitType.EVEN_ALL.value:
        return get_member_ids(itinerary_id)
    participants = data.get("participant_ids") or []
    if not participants:
        raise BadRequestError("Choose who to split this expense with.")
    _require_members(itinerary_id, participants)
    return participants


def _write_shares(expense: Expense, itinerary_id: int, data: dict):
    participants = _participants(
        itinerary_id, expense.split_type, expense.paid_by_id, data
    )
    shares = compute_shares(expense.amount_gbp, expense.paid_by_id, participants)
    expense.shares.clear()
    db.session.flush()
    for user_id, amount in shares.items():
        expense.shares.append(ExpenseShare(user_id=user_id, amount_gbp=amount))


def get_expenses(itinerary_id: int) -> list[Expense]:
    stmt = (
        select(Expense)
        .where(Expense.itinerary_id == itinerary_id)
        .order_by(Expense.spent_on.desc(), Expense.id.desc())
    )
    return list(db.session.execute(stmt).scalars().all())


def get_expense(itinerary_id: int, expense_id: int) -> Expense:
    stmt = select(Expense).where(
        Expense.id == expense_id, Expense.itinerary_id == itinerary_id
    )
    expense = db.session.execute(stmt).scalar_one_or_none()
    if not expense:
        raise NotFoundError("Expense not found.")
    return expense


def create_expense(user_id: int | None, itinerary_id: int, data: dict) -> Expense:
    user_id = _require_user(user_id)
    try:
        payer_id = data.get("paid_by_id") or user_id
        _require_members(itinerary_id, [payer_id])
        _validate_links(itinerary_id, data)
        amount = to_money(data["amount"])
        currency = data.get("currency", "GBP")
        rate = fx_service.get_rate(currency, "GBP", data["spent_on"])
        expense = Expense(
            itinerary_id=itinerary_id,
            description=data["description"],
            category=data.get("category", "other"),
            amount=amount,
            currency=currency,
            amount_gbp=to_money(amount * rate),
            fx_rate=rate,
            spent_on=data["spent_on"],
            paid_by_id=payer_id,
            event_id=data.get("event_id"),
            accommodation_id=data.get("accommodation_id"),
            split_type=data.get("split_type", SplitType.EVEN_ALL.value),
            created_by_id=user_id,
            updated_by_id=user_id,
        )
        db.session.add(expense)
        db.session.flush()
        _write_shares(expense, itinerary_id, data)
        db.session.commit()
        return expense
    except Exception:
        db.session.rollback()
        raise


def _require_owner_or_admin(user_id: int | None, role: str, expense: Expense):
    if role != UserRole.ADMIN.value and expense.created_by_id != user_id:
        raise UserNotAuthorisedError(
            "Only the person who added an expense or an admin can change it."
        )


def update_expense(
    user_id: int | None, role: str, itinerary_id: int, expense_id: int, data: dict
) -> Expense:
    user_id = _require_user(user_id)
    try:
        expense = get_expense(itinerary_id, expense_id)
        _require_owner_or_admin(user_id, role, expense)

        event_id = data["event_id"] if "event_id" in data else expense.event_id
        accommodation_id = (
            data["accommodation_id"]
            if "accommodation_id" in data
            else expense.accommodation_id
        )
        if data.get("event_id") and "accommodation_id" not in data:
            accommodation_id = None
        if data.get("accommodation_id") and "event_id" not in data:
            event_id = None
        _validate_links(
            itinerary_id, {"event_id": event_id, "accommodation_id": accommodation_id}
        )
        expense.event_id = event_id
        expense.accommodation_id = accommodation_id

        for field in ("description", "category"):
            if field in data:
                setattr(expense, field, data[field])
        if {"amount", "currency", "spent_on"} & data.keys():
            amount = to_money(data.get("amount", expense.amount))
            currency = data.get("currency", expense.currency)
            spent_on = data.get("spent_on", expense.spent_on)
            rate = fx_service.get_rate(currency, "GBP", spent_on)
            expense.amount, expense.currency, expense.spent_on = amount, currency, spent_on
            expense.fx_rate = rate
            expense.amount_gbp = to_money(amount * rate)
        if "paid_by_id" in data:
            _require_members(itinerary_id, [data["paid_by_id"]])
            expense.paid_by_id = data["paid_by_id"]
        if "split_type" in data:
            expense.split_type = data["split_type"]

        expense.updated_by_id = user_id
        _write_shares(
            expense,
            itinerary_id,
            {
                "participant_ids": data.get("participant_ids")
                or [s.user_id for s in expense.shares]
            },
        )
        db.session.commit()
        return expense
    except Exception:
        db.session.rollback()
        raise


def delete_expense(
    user_id: int | None, role: str, itinerary_id: int, expense_id: int
) -> int:
    try:
        expense = get_expense(itinerary_id, expense_id)
        _require_owner_or_admin(user_id, role, expense)
        db.session.delete(expense)
        db.session.commit()
        return expense_id
    except Exception:
        db.session.rollback()
        raise


def get_settlements(itinerary_id: int) -> list[Settlement]:
    stmt = (
        select(Settlement)
        .where(Settlement.itinerary_id == itinerary_id)
        .order_by(Settlement.settled_on.desc(), Settlement.id.desc())
    )
    return list(db.session.execute(stmt).scalars().all())


def get_settlement(itinerary_id: int, settlement_id: int) -> Settlement:
    stmt = select(Settlement).where(
        Settlement.id == settlement_id, Settlement.itinerary_id == itinerary_id
    )
    settlement = db.session.execute(stmt).scalar_one_or_none()
    if not settlement:
        raise NotFoundError("Settlement not found.")
    return settlement


def create_settlement(user_id: int | None, itinerary_id: int, data: dict) -> Settlement:
    user_id = _require_user(user_id)
    try:
        if data["from_user_id"] == data["to_user_id"]:
            raise BadRequestError("A settlement needs two different people.")
        _require_members(itinerary_id, [data["from_user_id"], data["to_user_id"]])
        settlement = Settlement(
            itinerary_id=itinerary_id,
            from_user_id=data["from_user_id"],
            to_user_id=data["to_user_id"],
            amount_gbp=to_money(data["amount_gbp"]),
            settled_on=data["settled_on"],
            created_by_id=user_id,
            updated_by_id=user_id,
        )
        db.session.add(settlement)
        db.session.commit()
        return settlement
    except Exception:
        db.session.rollback()
        raise


def update_settlement(
    user_id: int | None, role: str, itinerary_id: int, settlement_id: int, data: dict
) -> Settlement:
    user_id = _require_user(user_id)
    try:
        settlement = get_settlement(itinerary_id, settlement_id)
        _require_owner_or_admin(user_id, role, settlement)  # type: ignore[arg-type]
        from_id = data.get("from_user_id", settlement.from_user_id)
        to_id = data.get("to_user_id", settlement.to_user_id)
        if from_id == to_id:
            raise BadRequestError("A settlement needs two different people.")
        _require_members(itinerary_id, [from_id, to_id])
        settlement.from_user_id, settlement.to_user_id = from_id, to_id
        if "amount_gbp" in data:
            settlement.amount_gbp = to_money(data["amount_gbp"])
        if "settled_on" in data:
            settlement.settled_on = data["settled_on"]
        settlement.updated_by_id = user_id
        db.session.commit()
        return settlement
    except Exception:
        db.session.rollback()
        raise


def delete_settlement(
    user_id: int | None, role: str, itinerary_id: int, settlement_id: int
) -> int:
    try:
        settlement = get_settlement(itinerary_id, settlement_id)
        _require_owner_or_admin(user_id, role, settlement)  # type: ignore[arg-type]
        db.session.delete(settlement)
        db.session.commit()
        return settlement_id
    except Exception:
        db.session.rollback()
        raise


def get_balances(itinerary_id: int) -> dict:
    expenses = get_expenses(itinerary_id)
    settlements = get_settlements(itinerary_id)
    net = compute_net_balances(expenses, settlements)
    member_ids = set(get_member_ids(itinerary_id)) | set(net)
    users = {
        u.id: u
        for u in db.session.execute(select(User).where(User.id.in_(member_ids)))
        .scalars()
        .all()
    }
    return {
        "balances": [
            {
                "user_id": uid,
                "username": users[uid].username if uid in users else "Unknown",
                "net_gbp": net.get(uid, Decimal("0")),
            }
            for uid in sorted(member_ids)
        ],
        "transfers": simplify_debts(net),
        "total_spent_gbp": sum((e.amount_gbp for e in expenses), Decimal("0")),
    }

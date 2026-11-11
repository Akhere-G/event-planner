from ...models import Itinerary
from ...services import expense_service
from ..context import Requester
from .base import EntityDescriber, EntityDescription


def _person(requester: Requester, user_id: int) -> str:
    return f"{user_id} ({requester.members.get(user_id, 'Someone')})"


def _may_change(requester: Requester, created_by_id: int | None) -> bool:
    return requester.is_admin or created_by_id == requester.user_id


class ExpenseDescriber(EntityDescriber):
    entity = "expense"
    title = "EXPENSES (only those you may change)"

    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        descriptions = {}
        for expense in expense_service.get_expenses(itinerary.id):
            if not _may_change(requester, expense.created_by_id):
                continue
            shares = []
            for share in expense.shares:
                shares.append(
                    f"{_person(requester, share.user_id)} £{share.amount_gbp}"
                )
            descriptions[expense.id] = EntityDescription(
                id=expense.id,
                label=expense.description,
                summary=(
                    f"{expense.amount} {expense.currency} | {expense.category} | "
                    f"{expense.spent_on} | "
                    f"paid_by_id {_person(requester, expense.paid_by_id)} | "
                    f"split_type {expense.split_type} | shares: {', '.join(shares)}"
                ),
                values={"paid_by_id": expense.paid_by_id},
            )
        return descriptions


class SettlementDescriber(EntityDescriber):
    entity = "settlement"
    title = "SETTLEMENTS (payments between people; only those you may change)"

    def describe(
        self, itinerary: Itinerary, requester: Requester
    ) -> dict[int, EntityDescription]:
        descriptions = {}
        for settlement in expense_service.get_settlements(itinerary.id):
            if not _may_change(requester, settlement.created_by_id):
                continue
            payer = requester.members.get(settlement.from_user_id, "Someone")
            payee = requester.members.get(settlement.to_user_id, "Someone")
            descriptions[settlement.id] = EntityDescription(
                id=settlement.id,
                label=f"{payer} paid {payee} £{settlement.amount_gbp}",
                summary=(
                    f"from_user_id {_person(requester, settlement.from_user_id)} | "
                    f"to_user_id {_person(requester, settlement.to_user_id)} | "
                    f"{settlement.settled_on}"
                ),
                values={
                    "from_user_id": settlement.from_user_id,
                    "to_user_id": settlement.to_user_id,
                },
            )
        return descriptions

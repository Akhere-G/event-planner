from typing import Any, ClassVar

from ...models import ExpenseCategory, Itinerary, SplitType
from .. import expense_service
from .editor_base import EditContext, EntityEditor


def _category_names() -> str:
    names = []
    for category in ExpenseCategory:
        names.append(category.value)
    return " | ".join(names)


_CATEGORIES = _category_names()


class MemberEditor(EntityEditor):
    """An editor for records that name the trip's members and belong to one of them."""

    uses_members: ClassVar[bool] = True

    @classmethod
    def is_available(cls, context: EditContext) -> bool:
        return context.user_id is not None

    def _is_member(self, user_id: Any) -> bool:
        return type(user_id) is int and user_id in self.members

    def _person(self, user_id: int) -> str:
        return f"{user_id} ({self.members.get(user_id, 'unknown')})"

    def _may_change(self, created_by_id: int | None) -> bool:
        return self.is_admin or created_by_id == self.user_id

    def _may_act_as(self, person_id: int, current_id: int | None) -> bool:
        """Whether this user may name ``person_id`` where it is now ``current_id``."""
        return self.is_admin or person_id in (self.user_id, current_id)


class ExpenseEditor(MemberEditor):
    """Expenses the user may change; shares follow from the split, never set."""

    entity = "expense"
    title = "EXPENSES (only those you may change)"
    fields = (
        "description",
        "category",
        "amount",
        "currency",
        "spent_on",
        "paid_by_id",
        "split_type",
        "participant_ids",
    )
    create_required = ("description", "amount", "spent_on")
    hint = (
        f"description, category ({_CATEGORIES}), amount (a number, in "
        "currency), currency (3-letter code, GBP when omitted), spent_on "
        "(YYYY-MM-DD), paid_by_id (a person id; the requester when omitted), "
        "split_type (even_all = everyone, selected = the people in participant_ids, "
        "self = only the payer), participant_ids (person ids, only with selected)"
    )
    notes = (
        "each person's share is worked out from split_type and participant_ids, so "
        "never send shares. Changing who an expense is split between means changing "
        "split_type and participant_ids."
    )

    def describe_items(self, itinerary: Itinerary) -> dict[int, str]:
        self.payer_ids: dict[int, int] = {}
        descriptions = {}
        for expense in expense_service.get_expenses(itinerary.id):
            if not self._may_change(expense.created_by_id):
                continue
            self.payer_ids[expense.id] = expense.paid_by_id
            shares = []
            for share in expense.shares:
                shares.append(f"{self._person(share.user_id)} £{share.amount_gbp}")
            descriptions[expense.id] = (
                f"{expense.description} | {expense.amount} {expense.currency} | "
                f"{expense.category} | {expense.spent_on} | "
                f"paid_by_id {self._person(expense.paid_by_id)} | "
                f"split_type {expense.split_type} | shares: {', '.join(shares)}"
            )
        return descriptions

    def normalise(
        self, kind: str, item_id: int | None, data: dict[str, Any]
    ) -> dict[str, Any] | None:
        if "paid_by_id" in data and not self._may_pay(item_id, data["paid_by_id"]):
            return None
        people = data.get("participant_ids")
        if "participant_ids" in data and not self._are_members(people):
            return None
        if kind == "create" and data.get("split_type") == SplitType.SELECTED.value:
            return data if people else None
        return data

    def _may_pay(self, item_id: int | None, payer_id: Any) -> bool:
        return self._is_member(payer_id) and self._may_act_as(
            payer_id, self.payer_ids.get(item_id)
        )

    def _are_members(self, people: Any) -> bool:
        if not isinstance(people, list) or not people:
            return False
        return all(map(self._is_member, people))


class SettlementEditor(MemberEditor):
    """Payments between two members that the user may change."""

    entity = "settlement"
    title = "SETTLEMENTS (payments between people; only those you may change)"
    fields = ("from_user_id", "to_user_id", "amount_gbp", "settled_on")
    create_required = fields
    hint = (
        "from_user_id (the person who paid), to_user_id (the person who was paid), "
        "amount_gbp (a number, in GBP), settled_on (YYYY-MM-DD)"
    )

    def describe_items(self, itinerary: Itinerary) -> dict[int, str]:
        self.parties: dict[int, tuple[int, int]] = {}
        descriptions = {}
        for settlement in expense_service.get_settlements(itinerary.id):
            if not self._may_change(settlement.created_by_id):
                continue
            self.parties[settlement.id] = (
                settlement.from_user_id,
                settlement.to_user_id,
            )
            descriptions[settlement.id] = (
                f"from_user_id {self._person(settlement.from_user_id)} paid "
                f"to_user_id {self._person(settlement.to_user_id)} | "
                f"£{settlement.amount_gbp} | {settlement.settled_on}"
            )
        return descriptions

    def normalise(
        self, kind: str, item_id: int | None, data: dict[str, Any]
    ) -> dict[str, Any] | None:
        current_from, current_to = self.parties.get(item_id, (None, None))
        for field in ("from_user_id", "to_user_id"):
            if field in data and not self._is_member(data[field]):
                return None
        from_id = data.get("from_user_id", current_from)
        if from_id == data.get("to_user_id", current_to):
            return None
        if "from_user_id" in data and not self._may_act_as(from_id, current_from):
            return None
        return data

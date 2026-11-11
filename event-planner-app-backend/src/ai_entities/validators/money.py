from typing import ClassVar

from ...models import ExpenseCategory, SplitType
from ...utils.clock import utcnow
from ..context import Requester
from ..describers.base import EntityDescription
from ..json_types import JsonObject, JsonValue
from ..parsing import as_int, as_list
from .base import EntityValidator


def _category_names() -> str:
    names = []
    for category in ExpenseCategory:
        names.append(category.value)
    return " | ".join(names)


class MemberEntityValidator(EntityValidator):
    """Entities that name trip members, which only a signed-in member may change."""

    uses_members: ClassVar[bool] = True
    date_field: ClassVar[str]

    @classmethod
    def is_available(cls, requester: Requester) -> bool:
        return requester.user_id is not None

    def tidy(self, data: JsonObject) -> JsonObject:
        tidied = {}
        for field, value in data.items():
            if value is not None:
                tidied[field] = value
        day = tidied.get(self.date_field)
        if isinstance(day, str):
            tidied[self.date_field] = day[:10]
        return tidied

    def defaults(self, data: JsonObject) -> JsonObject:
        return {self.date_field: utcnow().date().isoformat(), **data}

    def _member_id(self, value: JsonValue) -> int | None:
        member_id = as_int(value)
        return member_id if member_id in self.context.requester.members else None

    def _is_member(self, value: JsonValue) -> bool:
        return self._member_id(value) is not None

    def _may_act_as(self, person_id: int, current_id: int | None) -> bool:
        requester = self.context.requester
        return requester.is_admin or person_id in (requester.user_id, current_id)


class ExpenseValidator(MemberEntityValidator):
    """Shares follow from the split, so they are never taken from the AI."""

    entity = "expense"
    date_field = "spent_on"
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
    prompt_hint = (
        f"description, category ({_category_names()}), amount (a number, in "
        "currency), currency (3-letter code, GBP when omitted), spent_on "
        "(YYYY-MM-DD, today when omitted), "
        "paid_by_id (a person id; the requester when omitted), "
        "split_type (even_all = everyone, selected = the people in participant_ids, "
        "self = only the payer), participant_ids (person ids, only with selected)"
    )
    prompt_notes = (
        "each person's share is worked out from split_type and participant_ids, so "
        "never send shares. Changing who an expense is split between means changing "
        "split_type and participant_ids."
    )

    def tidy(self, data: JsonObject) -> JsonObject:
        tidied = super().tidy(data)
        category, currency = tidied.get("category"), tidied.get("currency")
        if isinstance(category, str):
            tidied["category"] = category.strip().lower()
        if isinstance(currency, str):
            tidied["currency"] = currency.strip().upper()
        if tidied.get("split_type", SplitType.SELECTED.value) != (
            SplitType.SELECTED.value
        ):
            tidied.pop("participant_ids", None)
        return tidied

    def check_create(self, data: JsonObject) -> JsonObject | None:
        if self._is_unusable(data, current_payer_id=None):
            return None
        selected = data.get("split_type") == SplitType.SELECTED.value
        return None if selected and not data.get("participant_ids") else data

    def check_edit(
        self, current: EntityDescription, data: JsonObject
    ) -> JsonObject | None:
        payer_id = as_int(current.values["paid_by_id"])
        return None if self._is_unusable(data, payer_id) else data

    def _is_unusable(self, data: JsonObject, current_payer_id: int | None) -> bool:
        if "paid_by_id" in data:
            payer_id = self._member_id(data["paid_by_id"])
            if payer_id is None or not self._may_act_as(payer_id, current_payer_id):
                return True
        return "participant_ids" in data and not self._are_members(
            data["participant_ids"]
        )

    def _are_members(self, people: JsonValue) -> bool:
        listed = as_list(people)
        if not listed:
            return False
        return all(map(self._is_member, listed))


class SettlementValidator(MemberEntityValidator):
    entity = "settlement"
    date_field = "settled_on"
    fields = ("from_user_id", "to_user_id", "amount_gbp", "settled_on")
    create_required = fields
    prompt_hint = (
        "from_user_id (the person who paid), to_user_id (the person who was paid), "
        "amount_gbp (a number, in GBP), settled_on (YYYY-MM-DD)"
    )

    def check_create(self, data: JsonObject) -> JsonObject | None:
        return self._checked(data, None, None)

    def check_edit(
        self, current: EntityDescription, data: JsonObject
    ) -> JsonObject | None:
        return self._checked(
            data,
            as_int(current.values["from_user_id"]),
            as_int(current.values["to_user_id"]),
        )

    def _checked(
        self, data: JsonObject, current_from: int | None, current_to: int | None
    ) -> JsonObject | None:
        from_id, to_id = current_from, current_to
        if "from_user_id" in data:
            from_id = self._member_id(data["from_user_id"])
        if "to_user_id" in data:
            to_id = self._member_id(data["to_user_id"])
        if from_id is None or to_id is None or from_id == to_id:
            return None
        if "from_user_id" in data and not self._may_act_as(from_id, current_from):
            return None
        return data

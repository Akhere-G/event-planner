from typing import Literal, NotRequired, TypedDict

from ..ai_entities.json_types import JsonObject


class ChangeBase(TypedDict):
    updated_at: str | None


class ChangeOp(TypedDict):
    """One proposed change; `id` and `label` are only there for what already exists."""

    op: Literal["create", "update", "delete"]
    entity: str
    data: JsonObject
    reason: str | None
    id: NotRequired[int]
    label: NotRequired[str]
    base: NotRequired[ChangeBase]

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, datetime, time
from typing import Any

from ..ai_entities.json_types import JsonObject, JsonValue
from ..ai_entities.parsing import as_list
from ..ai_entities.validators.base import EntityValidator
from ..exceptions import AIResponseError
from ..services.flight_context import FlightWindow, overlaps_any


def validate_insights(insights: Any) -> list[dict[str, str]]:
    if not isinstance(insights, list):
        raise AIResponseError("AI response must be a list.")

    validated = []

    for insight in insights:
        if not isinstance(insight, dict):
            continue

        title = insight.get("title")
        content = insight.get("content")

        if not isinstance(title, str) or not isinstance(content, str):
            continue

        validated.append(
            {
                "title": title,
                "content": content,
            }
        )

    return validated


def _clashes_with_flight(
    blocked: Sequence[FlightWindow], start: datetime, end: datetime
) -> bool:
    # Any offset the model added is ignored, as it is when the time is saved.
    return overlaps_any(blocked, start.replace(tzinfo=None), end.replace(tzinfo=None))


def validate_event_suggestion(
    event: Any, requested_date: str, blocked: Sequence[FlightWindow] = ()
) -> bool:
    """
    Validate the basic structure and temporal constraints of an
    AI-generated event suggestion, including staying clear of `blocked` flights.
    """
    if not isinstance(event, dict):
        return False

    required_fields = [
        "name",
        "description",
        "address",
        "start_at",
        "end_at",
        "category",
    ]

    for field in required_fields:
        if not isinstance(event.get(field), str):
            return False

    try:
        start_at = datetime.fromisoformat(event["start_at"].replace("Z", "+00:00"))
        end_at = datetime.fromisoformat(event["end_at"].replace("Z", "+00:00"))
    except ValueError:
        return False

    if start_at.date().isoformat() != requested_date:
        return False

    if end_at.date().isoformat() != requested_date:
        return False

    if end_at <= start_at:
        return False

    return not _clashes_with_flight(blocked, start_at, end_at)


@dataclass(frozen=True)
class OptimisationRules:
    day: date
    event_ids: frozenset[int]
    locked_ids: frozenset[int] = frozenset()
    allow_add_remove: bool = False
    day_start: time | None = None
    day_end: time | None = None
    blocked: tuple[FlightWindow, ...] = ()

    def allows_times(self, start: datetime, end: datetime) -> bool:
        if start.date() != self.day or end.date() != self.day or end <= start:
            return False
        if self.day_start and start.time() < self.day_start:
            return False
        if self.day_end and end.time() > self.day_end:
            return False
        return not _clashes_with_flight(self.blocked, start, end)

    def can_change(self, event_id: Any) -> bool:
        return (
            isinstance(event_id, int)
            and event_id in self.event_ids
            and event_id not in self.locked_ids
        )


def _parse_times(item: dict) -> tuple[datetime, datetime] | None:
    try:
        return (
            datetime.fromisoformat(str(item["start_at"]).replace("Z", "+00:00")),
            datetime.fromisoformat(str(item["end_at"]).replace("Z", "+00:00")),
        )
    except (KeyError, ValueError):
        return None


def validate_optimisation_ops(
    raw_ops: Any, rules: OptimisationRules
) -> list[dict[str, Any]]:
    """Keep only the changes the rules allow. Anything else the AI proposed is dropped.

    Returns dicts with an `action` of update, delete or create. Times stay as the
    trip-local wall-clock values the AI was asked for.
    """
    if not isinstance(raw_ops, list):
        raise AIResponseError("AI response must be a list.")

    validated = []
    for item in raw_ops:
        if not isinstance(item, dict):
            continue
        action = item.get("action", "update")
        reason = item.get("reason")

        if action == "update" and rules.can_change(item.get("id")):
            times = _parse_times(item)
            if times and rules.allows_times(*times):
                validated.append(
                    {
                        "action": "update",
                        "id": item["id"],
                        "start_at": times[0],
                        "end_at": times[1],
                        "reason": reason,
                    }
                )
        elif action == "delete" and rules.allow_add_remove:
            if rules.can_change(item.get("id")):
                validated.append(
                    {"action": "delete", "id": item["id"], "reason": reason}
                )
        elif action == "create" and rules.allow_add_remove:
            times = _parse_times(item)
            if (
                times
                and rules.allows_times(*times)
                and validate_event_suggestion(item, rules.day.isoformat())
            ):
                validated.append({**item, "action": "create"})

    return validated


def validate_creates(
    raw_items: JsonValue, validator: EntityValidator
) -> list[JsonObject]:
    items = as_list(raw_items)
    if items is None:
        raise AIResponseError("AI response must be a list.")

    valid = []
    for item in items:
        data = validator.validate_create(item)
        if data is not None:
            valid.append(data)
    return valid

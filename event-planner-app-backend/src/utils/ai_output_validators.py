from datetime import datetime
from typing import Any

from ..models import Event


def validate_insights(insights: Any) -> list[dict[str, str]]:
    if not isinstance(insights, list):
        raise ValueError("AI response must be a list.")

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


def validate_event_suggestion(event: Any, requested_date: str) -> bool:
    """
    Validate the basic structure and temporal constraints of an
    AI-generated event suggestion.
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

    if any(not isinstance(event.get(field), str) for field in required_fields):
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

    return not end_at <= start_at


def validate_optimised_events(
    optimised_events: Any,
    original_events: list[Event],
    event_date: datetime,
) -> list[dict[str, Any]]:
    """
    Validate AI-generated event optimisation results.
    """
    if not isinstance(optimised_events, list):
        raise ValueError("AI response must be a list.")

    original_events_by_id = {event.id: event for event in original_events}

    validated = []

    for event in optimised_events:
        if not isinstance(event, dict):
            continue

        event_id = event.get("id")
        start_at = event.get("start_at")
        end_at = event.get("end_at")

        if not isinstance(event_id, int):
            continue

        if event_id not in original_events_by_id:
            continue

        if not isinstance(start_at, str) or not isinstance(end_at, str):
            continue

        try:
            start = datetime.fromisoformat(start_at.replace("Z", "+00:00"))
            end = datetime.fromisoformat(end_at.replace("Z", "+00:00"))
        except ValueError:
            continue

        if start.date() != event_date.date():
            continue

        if end.date() != event_date.date():
            continue

        if end <= start:
            continue

        validated.append(
            {
                "id": event_id,
                "start_at": start,
                "end_at": end,
            }
        )

    return validated


def validate_packing_items(
    items: Any,
) -> list[dict[str, Any]]:
    if not isinstance(items, list):
        raise ValueError("AI response must be a list.")

    validated = []

    for item in items:
        if not isinstance(item, dict):
            continue

        name = item.get("name")
        category = item.get("category")
        is_shared = item.get("is_shared")

        if not isinstance(name, str):
            continue

        if not isinstance(category, str):
            continue

        if not isinstance(is_shared, bool):
            continue

        validated.append(
            {
                "name": name,
                "category": category,
                "is_shared": is_shared,
            }
        )

    return validated

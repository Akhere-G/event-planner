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
                "reason": event.get("reason"),
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


COST_ESTIMATE_KEYS = ("estimated_cost_gbp", "price_tier")
MAX_ESTIMATED_COST_GBP = 100_000
ESTIMATE_ENTITIES = ("event", "accommodation", "wishlist_item")


def extract_cost_estimate(item: Any) -> dict[str, Any]:
    """
    Pull a usable cost estimate (per person, GBP) and price tier out of an AI
    item. Anything missing or out of range is dropped rather than rejected, so
    a bad estimate never discards an otherwise good suggestion.
    """
    if not isinstance(item, dict):
        return {}

    estimate: dict[str, Any] = {}

    cost = item.get("estimated_cost_gbp")
    if (
        isinstance(cost, (int, float))
        and not isinstance(cost, bool)
        and 0 <= cost <= MAX_ESTIMATED_COST_GBP
    ):
        estimate["estimated_cost_gbp"] = round(float(cost), 2)

    tier = item.get("price_tier")
    if isinstance(tier, int) and not isinstance(tier, bool) and 1 <= tier <= 4:
        estimate["price_tier"] = tier

    return estimate


def validate_cost_estimates(
    estimates: Any,
    requested: set[tuple[str, int]],
) -> list[dict[str, Any]]:
    """
    Validate AI cost estimates for existing items. Only items that were asked
    about are kept, each at most once, and each needs at least one usable value.
    """
    if not isinstance(estimates, list):
        raise ValueError("AI response must be a list.")

    validated = []
    seen: set[tuple[str, int]] = set()

    for item in estimates:
        if not isinstance(item, dict):
            continue

        entity = item.get("entity")
        item_id = item.get("id")

        if entity not in ESTIMATE_ENTITIES or not isinstance(item_id, int):
            continue

        key = (entity, item_id)
        if key not in requested or key in seen:
            continue

        estimate = extract_cost_estimate(item)
        if not estimate:
            continue

        seen.add(key)
        validated.append(
            {"entity": entity, "id": item_id, **estimate, "reason": item.get("reason")}
        )

    return validated

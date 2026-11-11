from typing import Any

from ..ai_entities.json_types import JsonObject, JsonValue
from ..ai_entities.parsing import as_list
from ..ai_entities.validators.base import EntityValidator
from ..exceptions import AIResponseError


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

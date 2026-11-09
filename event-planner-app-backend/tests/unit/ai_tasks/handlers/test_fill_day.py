import json
from datetime import date
from unittest.mock import patch

import pytest
from src.ai_tasks.context import TaskContext
from src.ai_tasks.registry import get_handler
from src.exceptions import AIProviderError, AIResponseError
from src.schemas.ai_schema import EventSuggestionRequestSchema

SUGGESTIONS = [
    {
        "name": "Louvre",
        "description": "World famous museum",
        "address": "Rue de Rivoli, Paris",
        "start_at": "2026-08-02T10:00:00",
        "end_at": "2026-08-02T12:00:00",
        "category": "Museum",
        "reason": "Matches your art interest.",
    },
    {  # wrong day: dropped
        "name": "Elsewhere",
        "description": "x",
        "address": "y",
        "start_at": "2026-08-03T10:00:00",
        "end_at": "2026-08-03T12:00:00",
        "category": "Museum",
    },
]
PLACE = {
    "latitude": 48.86,
    "longitude": 2.33,
    "formatted_address": "Rue de Rivoli, Paris",
}
PARAMS = {"date": "2026-08-02", "pace": "balanced", "companions": "couple"}


class Reports:
    def __init__(self):
        self.calls = []

    def report(self, text, current=None, total=None):
        self.calls.append((text, current, total))


def run_handler(itinerary, ai_reply=None, ai_error=None, params=None):
    reports = Reports()
    ctx = TaskContext(
        task_id=1,
        itinerary_id=itinerary.id,
        user_id=None,
        params=params or PARAMS,
        reporter=reports,
    )
    with (
        patch(
            "src.services.ai_services.get_ai_response",
            return_value=json.dumps(SUGGESTIONS) if ai_reply is None else ai_reply,
            side_effect=ai_error,
        ),
        patch("src.services.ai_services.get_place_details", return_value=PLACE),
    ):
        return get_handler("fill_day").run(ctx), reports


def test_suggestions_for_the_day_become_create_ops(itinerary):
    ops, _ = run_handler(itinerary)

    assert len(ops) == 1
    assert ops[0]["op"] == "create"
    assert ops[0]["entity"] == "event"
    assert ops[0]["reason"] == "Matches your art interest."
    assert ops[0]["data"]["name"] == "Louvre"
    assert ops[0]["data"]["start_at"] == "2026-08-02T08:00:00Z"  # Paris is UTC+2


def test_progress_is_reported_per_place(itinerary):
    _, reports = run_handler(itinerary)

    assert reports.calls[0][0] == "Asking the AI for ideas"
    assert ("Looking up places", 1, 1) in reports.calls


def test_a_day_with_nothing_valid_yields_no_ops(itinerary):
    ops, _ = run_handler(itinerary, ai_reply="[]")

    assert ops == []


def test_provider_failure_raises(itinerary):
    with pytest.raises(AIProviderError):
        run_handler(itinerary, ai_error=AIProviderError())


def test_non_list_reply_raises(itinerary):
    with pytest.raises(AIResponseError):
        run_handler(itinerary, ai_reply='{"not": "a list"}')


def test_a_place_that_cannot_be_found_is_skipped(itinerary):
    ctx = TaskContext(1, itinerary.id, None, PARAMS, Reports())
    with (
        patch(
            "src.services.ai_services.get_ai_response",
            return_value=json.dumps(SUGGESTIONS),
        ),
        patch(
            "src.services.ai_services.get_place_details",
            side_effect=Exception("not found"),
        ),
    ):
        assert get_handler("fill_day").run(ctx) == []


def test_tasks_for_different_days_do_not_conflict():
    handler = get_handler("fill_day")

    assert handler.conflict_scope({"date": "2026-08-01"}).isdisjoint(
        handler.conflict_scope({"date": "2026-08-02"})
    )
    assert handler.conflict_scope({"date": "2026-08-01"}) == handler.conflict_scope(
        {"date": "2026-08-01"}
    )


def test_params_normalise_to_json_safe_snake_case():
    schema = EventSuggestionRequestSchema()

    stored = schema.dump(schema.load({"date": "2026-08-02", "pace": "packed"}))

    assert stored["date"] == "2026-08-02"
    assert json.dumps(stored)
    assert schema.load(stored)["date"] == date(2026, 8, 2)

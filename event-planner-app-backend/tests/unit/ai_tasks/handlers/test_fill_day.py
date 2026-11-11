import json
from datetime import UTC, date, datetime
from unittest.mock import patch

import pytest
from src.ai_tasks.context import TaskContext
from src.ai_tasks.registry import get_handler
from src.exceptions import AIProviderError, AIResponseError
from src.schemas.ai_schema import EventSuggestionRequestSchema
from tests.factories import FlightFactory

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
    prompts = []

    def fake_ai(prompt):
        prompts.append(prompt)
        if ai_error:
            raise ai_error
        return json.dumps(SUGGESTIONS) if ai_reply is None else ai_reply

    ctx = TaskContext(
        task_id=1,
        itinerary_id=itinerary.id,
        user_id=None,
        params=params or PARAMS,
        reporter=reports,
    )
    with (
        patch("src.services.ai_services.get_ai_response", fake_ai),
        patch("src.ai_entities.places.get_place_details", return_value=PLACE),
    ):
        return get_handler("fill_day").run(ctx), reports, prompts


def test_suggestions_for_the_day_become_create_ops(itinerary):
    ops, _, _ = run_handler(itinerary)

    assert len(ops) == 1
    assert ops[0]["op"] == "create"
    assert ops[0]["entity"] == "event"
    assert ops[0]["reason"] == "Matches your art interest."
    assert ops[0]["data"]["name"] == "Louvre"
    assert ops[0]["data"]["start_at"] == "2026-08-02T08:00:00Z"  # Paris is UTC+2


def test_progress_is_reported_per_suggestion(itinerary):
    _, reports, _ = run_handler(itinerary)

    assert reports.calls[0][0] == "Asking the AI for ideas"
    assert ("Looking up places", 1, 2) in reports.calls
    assert ("Looking up places", 2, 2) in reports.calls


def test_a_day_with_nothing_valid_yields_no_ops(itinerary):
    ops, _, _ = run_handler(itinerary, ai_reply="[]")

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
            "src.ai_entities.places.get_place_details",
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


def fly(itinerary, depart_hour, arrive_hour, day=2):
    """A flight whose times are UTC hours on the given August day."""
    return FlightFactory(
        itinerary=itinerary,
        depart_at=datetime(2026, 8, day, depart_hour, tzinfo=UTC),
        arrive_at=datetime(2026, 8, day, arrive_hour, tzinfo=UTC),
    )


def test_the_prompt_has_no_flight_section_without_flights(itinerary):
    _, _, prompts = run_handler(itinerary)

    assert "FLIGHTS" not in prompts[0]


def test_a_flight_on_the_day_is_in_the_prompt_in_trip_local_time(itinerary):
    fly(itinerary, depart_hour=12, arrive_hour=14)  # Paris: 14:00 to 16:00

    _, _, prompts = run_handler(itinerary)

    assert "FLIGHTS" in prompts[0]
    assert "LHR → CDG: flies 2026-08-02T14:00 to 2026-08-02T16:00" in prompts[0]
    assert "blocked 2026-08-02T11:00 to 2026-08-02T18:00" in prompts[0]
    assert "Fit only as many items as" in prompts[0]


def test_a_flight_on_another_day_is_left_out_of_the_prompt(itinerary):
    fly(itinerary, depart_hour=12, arrive_hour=14, day=5)

    _, _, prompts = run_handler(itinerary)

    assert "FLIGHTS" not in prompts[0]


def test_a_suggestion_inside_the_flight_window_is_dropped(itinerary):
    fly(
        itinerary, depart_hour=8, arrive_hour=10
    )  # Paris 10:00-12:00, blocked 07:00-14:00

    ops, _, _ = run_handler(itinerary)

    assert ops == []


def test_a_suggestion_clear_of_the_flight_is_kept(itinerary):
    fly(
        itinerary, depart_hour=14, arrive_hour=15
    )  # Paris 16:00-17:00, blocked 13:00-19:00

    ops, _, _ = run_handler(itinerary)

    assert [op["data"]["name"] for op in ops] == ["Louvre"]

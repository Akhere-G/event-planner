import json
from unittest.mock import patch

import pytest
from src.ai_tasks.context import TaskContext
from src.ai_tasks.registry import get_handler
from src.exceptions import AIProviderError, AIResponseError
from src.extensions import db
from src.models import Event
from src.services.change_set_service import validate_ops
from tests.factories import EventFactory

PLAN = {
    "events": [
        {
            "name": "Louvre",
            "description": "Museum",
            "address": "Rue de Rivoli, Paris",
            "start_at": "2026-08-01T10:00:00",
            "end_at": "2026-08-01T12:00:00",
            "category": "Museum",
            "reason": "Matches your museum interest.",
        },
        {  # outside the trip dates: dropped
            "name": "Elsewhere",
            "description": "x",
            "address": "y",
            "start_at": "2026-09-01T10:00:00",
            "end_at": "2026-09-01T12:00:00",
            "category": "Museum",
        },
        {  # end before start: dropped
            "name": "Bad",
            "description": "x",
            "address": "y",
            "start_at": "2026-08-02T12:00:00",
            "end_at": "2026-08-02T10:00:00",
            "category": "Museum",
        },
    ],
    "accommodations": [
        {
            "name": "Hotel Paris",
            "address": "1 Rue",
            "start_date": "2026-07-30",
            "end_date": "2026-08-03",
            "reason": "Central.",
        }
    ],
    "packing_items": [
        {
            "name": "Umbrella",
            "category": "Misc",
            "is_shared": True,
            "reason": "Showers.",
        },
        {"name": 5},
    ],
    "wishlist_items": [{"name": "Seine cruise", "reason": "Relaxing."}],
}
PLACE = {"latitude": 48.86, "longitude": 2.33, "formatted_address": "Paris, France"}


class Reports:
    def __init__(self):
        self.calls = []

    def report(self, text, current=None, total=None):
        self.calls.append((text, current, total))


def run_handler(itinerary, user_id=None, ai_reply=None, ai_error=None):
    reports = Reports()
    ctx = TaskContext(
        task_id=1,
        itinerary_id=itinerary.id,
        user_id=user_id,
        params={},
        reporter=reports,
    )
    reply = patch(
        "src.services.ai_services.get_ai_response",
        return_value=json.dumps(PLAN) if ai_reply is None else ai_reply,
        side_effect=ai_error,
    )
    with (
        reply,
        patch(
            "src.services.trip_generation_service.get_place_details",
            return_value=PLACE,
        ),
    ):
        return get_handler("generate_trip").run(ctx), reports


def test_plan_becomes_ops_in_section_order(itinerary):
    ops, _ = run_handler(itinerary)

    assert [(o["entity"], o["op"]) for o in ops] == [
        ("accommodation", "create"),
        ("event", "create"),
        ("packing_item", "create"),
        ("wishlist_item", "create"),
    ]
    assert all(o["reason"] for o in ops)
    assert ops[1]["data"]["start_at"] == "2026-08-01T08:00:00Z"  # Paris is UTC+2
    assert ops[0]["data"]["start_date"] == "2026-08-01"  # clamped to the trip
    assert ops[3]["data"]["wishlist_name"] == "AI ideas"


def test_running_the_handler_saves_nothing(itinerary):
    existing = EventFactory(itinerary=itinerary)

    run_handler(itinerary)

    assert db.session.get(Event, existing.id) is not None
    assert len(itinerary.events) == 1


def test_generated_ops_pass_change_set_validation(itinerary):
    ops, _ = run_handler(itinerary)

    assert len(validate_ops(itinerary.id, ops, None)) == len(ops)


def test_progress_counts_the_places_to_look_up(itinerary):
    _, reports = run_handler(itinerary)

    lookups = []
    for call in reports.calls:
        if call[0] == "Looking up places":
            lookups.append(call)
    assert lookups[-1][1:] == (lookups[-1][2], lookups[-1][2])
    assert reports.calls[0][0] == "Asking the AI to plan your trip"


def test_provider_failure_raises_so_the_task_can_retry(itinerary):
    with pytest.raises(AIProviderError):
        run_handler(itinerary, ai_error=AIProviderError())


def test_unusable_reply_raises_instead_of_looking_empty(itinerary):
    with pytest.raises(AIResponseError):
        run_handler(itinerary, ai_reply="[1, 2]")


def test_rate_limit_depends_on_login(app):
    limit = get_handler("generate_trip").rate_limit

    with app.test_request_context():
        anonymous = limit()
    with app.test_request_context() as ctx:
        ctx.session["user_id"] = 1
        logged_in = limit()
    assert anonymous != logged_in

import json
from datetime import UTC, datetime
from unittest.mock import patch

import pytest
from src.ai_tasks.context import TaskContext
from src.ai_tasks.registry import get_handler
from src.exceptions import AIProviderError
from marshmallow import ValidationError
from tests.factories import EventFactory, FlightFactory


def paris(day, hour):
    """A UTC datetime for a Paris wall-clock time in August (UTC+2)."""
    return datetime(2026, 8, day, hour - 2, tzinfo=UTC)


class Reports:
    def __init__(self):
        self.calls = []

    def report(self, text, current=None, total=None):
        self.calls.append((text, current, total))


def make_events(itinerary):
    return {
        "morning": EventFactory(
            itinerary=itinerary,
            name="Louvre",
            start_at=paris(2, 9),
            end_at=paris(2, 11),
        ),
        "lunch": EventFactory(
            itinerary=itinerary,
            name="Bistro",
            start_at=paris(2, 12),
            end_at=paris(2, 13),
        ),
        "other_day": EventFactory(
            itinerary=itinerary,
            name="Eiffel",
            start_at=paris(3, 9),
            end_at=paris(3, 10),
        ),
    }


def run(itinerary, params, replies, hours=None, place=None):
    prompts = []

    def fake_ai(prompt):
        prompts.append(prompt)
        reply = replies.pop(0)
        if isinstance(reply, Exception):
            raise reply
        return json.dumps(reply)

    reports = Reports()
    ctx = TaskContext(1, itinerary.id, 5, params, reports)
    with (
        patch("src.services.day_optimisation_service.get_ai_response", fake_ai),
        patch(
            "src.services.day_optimisation_service.get_weekly_opening_hours",
            return_value=hours,
        ) as hours_lookup,
        patch(
            "src.ai_entities.places.get_place_details",
            return_value=place
            or {"latitude": 1.0, "longitude": 2.0, "formatted_address": "1 Rue, Paris"},
        ),
    ):
        ops = get_handler("optimise_day").run(ctx)
    return ops, prompts, reports, hours_lookup


def update_reply(event, start, end):
    return {
        "action": "update",
        "id": event.id,
        "start_at": f"2026-08-02T{start}:00",
        "end_at": f"2026-08-02T{end}:00",
        "reason": "Less walking.",
    }


def test_new_times_become_utc_update_ops(itinerary):
    events = make_events(itinerary)

    ops, prompts, _, _ = run(
        itinerary,
        {"dates": ["2026-08-02"]},
        [[update_reply(events["lunch"], "13:00", "14:00")]],
    )

    assert ops == [
        {
            "op": "update",
            "entity": "event",
            "id": events["lunch"].id,
            "data": {
                "start_at": "2026-08-02T11:00:00Z",
                "end_at": "2026-08-02T12:00:00Z",
            },
            "reason": "Less walking.",
        }
    ]
    assert "Eiffel" not in prompts[0]  # events on other days are not sent


def test_locked_events_are_marked_in_the_prompt_and_never_changed(itinerary):
    events = make_events(itinerary)
    params = {"dates": ["2026-08-02"], "lockedEventIds": [events["morning"].id]}

    ops, prompts, _, _ = run(
        itinerary,
        params,
        [[update_reply(events["morning"], "10:00", "12:00")]],
    )

    assert ops == []
    assert "LOCKED" in prompts[0]


def test_goals_pace_window_and_instructions_reach_the_prompt(itinerary):
    make_events(itinerary)
    params = {
        "dates": ["2026-08-02"],
        "goals": ["minimise_travel", "group_by_area"],
        "pace": "relaxed",
        "dayStart": "09:00",
        "dayEnd": "18:00",
        "instructions": "Keep lunch near the hotel",
    }

    _, prompts, _, _ = run(itinerary, params, [[]])

    prompt = prompts[0]
    assert "travel between consecutive events is as short" in prompt
    assert "same neighbourhood" in prompt
    assert "relaxed" in prompt
    assert "before 09:00" in prompt and "after 18:00" in prompt
    assert "<<<\nKeep lunch near the hotel\n>>>" in prompt


def test_opening_hours_are_looked_up_only_when_asked_for(itinerary):
    make_events(itinerary)
    weekly = [f"Day {n}: 9:00 AM - 5:00 PM" for n in range(7)]

    _, prompts, _, lookup = run(
        itinerary, {"dates": ["2026-08-02"]}, [[]], hours=weekly
    )
    lookup.assert_not_called()

    _, prompts, _, lookup = run(
        itinerary,
        {"dates": ["2026-08-02"], "goals": ["respect_opening_hours"]},
        [[]],
        hours=weekly,
    )
    assert lookup.call_count == 2
    assert "hours: Day 6: 9:00 AM - 5:00 PM" in prompts[0]  # 2 Aug 2026 is a Sunday


def test_unknown_opening_hours_are_flagged_not_invented(itinerary):
    make_events(itinerary)

    _, prompts, _, _ = run(
        itinerary,
        {"dates": ["2026-08-02"], "goals": ["respect_opening_hours"]},
        [[]],
        hours=None,
    )

    assert "opening hours unknown" in prompts[0]


def test_adding_and_removing_events_only_when_allowed(itinerary):
    events = make_events(itinerary)
    reply = [
        {
            "action": "delete",
            "id": events["lunch"].id,
            "reason": "Too close to brunch.",
        },
        {
            "action": "create",
            "name": "Cafe de Flore",
            "description": "Classic cafe",
            "address": "172 Bd Saint-Germain",
            "start_at": "2026-08-02T15:00:00",
            "end_at": "2026-08-02T16:00:00",
            "category": "Cafe",
            "reason": "Fits the gap.",
        },
    ]

    blocked, _, _, _ = run(itinerary, {"dates": ["2026-08-02"]}, [list(reply)])
    allowed, prompts, _, _ = run(
        itinerary,
        {"dates": ["2026-08-02"], "allowAddRemove": True},
        [list(reply)],
    )

    assert blocked == []
    assert [(o["op"], o["entity"]) for o in allowed] == [
        ("delete", "event"),
        ("create", "event"),
    ]
    assert allowed[0]["id"] == events["lunch"].id
    assert allowed[1]["data"]["latitude"] == 1.0
    assert "may also drop an event" in prompts[0]


def test_several_non_consecutive_days_get_one_ai_call_each(itinerary):
    events = make_events(itinerary)

    ops, prompts, reports, _ = run(
        itinerary,
        {"dates": ["2026-08-03", "2026-08-02"]},
        [
            [update_reply(events["lunch"], "13:00", "14:00")],
            [],
        ],
    )

    assert len(prompts) == 2
    assert "2026-08-02" in prompts[0] and "2026-08-03" in prompts[1]
    assert len(ops) == 1
    assert ("Optimising day 2 of 2", 2, 2) in reports.calls


def test_days_without_events_cost_no_ai_call(itinerary):
    ops, prompts, _, _ = run(itinerary, {"dates": ["2026-08-01"]}, [])

    assert ops == [] and prompts == []


def test_event_belongs_to_the_trip_local_day(itinerary):
    # 23:30 UTC on 1 Aug is 01:30 on 2 Aug in Paris.
    late = EventFactory(
        itinerary=itinerary,
        start_at=datetime(2026, 8, 1, 23, 30, tzinfo=UTC),
        end_at=datetime(2026, 8, 2, 0, 30, tzinfo=UTC),
    )

    _, prompts, _, _ = run(itinerary, {"dates": ["2026-08-02"]}, [[]])

    assert f"id: {late.id}" in prompts[0]


def test_provider_failure_raises_so_the_task_can_retry(itinerary):
    make_events(itinerary)

    with pytest.raises(AIProviderError):
        run(itinerary, {"dates": ["2026-08-02"]}, [AIProviderError()])


def test_days_outside_the_trip_are_rejected(itinerary):
    handler = get_handler("optimise_day")

    with pytest.raises(ValidationError):
        handler.validate_for_trip(itinerary, {"dates": ["2026-09-01"]})
    handler.validate_for_trip(itinerary, {"dates": ["2026-08-02"]})


def test_each_day_is_its_own_conflict_scope():
    handler = get_handler("optimise_day")

    one = handler.conflict_scope({"dates": ["2026-08-01", "2026-08-03"]})
    two = handler.conflict_scope({"dates": ["2026-08-02"]})
    three = handler.conflict_scope({"dates": ["2026-08-03"]})

    assert one.isdisjoint(two)
    assert not one.isdisjoint(three)


def fly(itinerary, departs, arrives):
    return FlightFactory(itinerary=itinerary, depart_at=departs, arrive_at=arrives)


def test_the_prompt_has_no_flight_section_without_flights(itinerary):
    make_events(itinerary)

    _, prompts, _, _ = run(itinerary, {"dates": ["2026-08-02"]}, [[]])

    assert "FLIGHTS" not in prompts[0]


def test_a_flight_that_day_is_shown_as_fixed_and_blocked(itinerary):
    make_events(itinerary)
    fly(itinerary, paris(2, 16), paris(2, 17))

    _, prompts, _, _ = run(itinerary, {"dates": ["2026-08-02"]}, [[]])

    assert "FLIGHTS (fixed and cannot be moved" in prompts[0]
    assert "LHR → CDG: flies 2026-08-02T16:00 to 2026-08-02T17:00" in prompts[0]
    assert "blocked 2026-08-02T13:00 to 2026-08-02T19:00" in prompts[0]


def test_flights_on_other_days_stay_out_of_the_prompt(itinerary):
    make_events(itinerary)
    fly(itinerary, paris(3, 16), paris(3, 17))

    _, prompts, _, _ = run(itinerary, {"dates": ["2026-08-02"]}, [[]])

    assert "FLIGHTS" not in prompts[0]


def test_a_flight_just_after_midnight_blocks_the_evening_before(itinerary):
    make_events(itinerary)
    fly(  # Paris 01:00 to 03:00 on the 3rd, so blocked from 22:00 on the 2nd
        itinerary,
        datetime(2026, 8, 2, 23, tzinfo=UTC),
        datetime(2026, 8, 3, 1, tzinfo=UTC),
    )

    _, prompts, _, _ = run(itinerary, {"dates": ["2026-08-02"]}, [[]])

    assert "blocked 2026-08-02T22:00" in prompts[0]


def test_a_new_time_inside_the_flight_window_is_dropped(itinerary):
    events = make_events(itinerary)
    fly(itinerary, paris(2, 16), paris(2, 17))  # blocked 13:00 to 19:00

    ops, _, _, _ = run(
        itinerary,
        {"dates": ["2026-08-02"]},
        [[update_reply(events["lunch"], "13:30", "14:30")]],
    )

    assert ops == []


def test_a_new_time_clear_of_the_flight_is_kept(itinerary):
    events = make_events(itinerary)
    fly(itinerary, paris(2, 16), paris(2, 17))

    ops, _, _, _ = run(
        itinerary,
        {"dates": ["2026-08-02"]},
        [[update_reply(events["lunch"], "11:30", "12:30")]],
    )

    assert [op["id"] for op in ops] == [events["lunch"].id]


def test_an_added_event_cannot_land_in_the_flight_window(itinerary):
    make_events(itinerary)
    fly(itinerary, paris(2, 16), paris(2, 17))
    create = {
        "action": "create",
        "name": "Cafe",
        "description": "Coffee",
        "address": "1 Rue, Paris",
        "start_at": "2026-08-02T15:00:00",
        "end_at": "2026-08-02T16:00:00",
        "category": "Cafe",
        "reason": "Snack.",
    }

    ops, _, _, _ = run(
        itinerary,
        {"dates": ["2026-08-02"], "allowAddRemove": True},
        [[create]],
    )

    assert ops == []

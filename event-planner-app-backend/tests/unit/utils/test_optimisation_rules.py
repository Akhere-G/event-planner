from datetime import date, datetime, time

import pytest
from src.exceptions import AIResponseError
from src.utils.ai_output_validators import OptimisationRules, validate_optimisation_ops

DAY = date(2026, 8, 2)


def rules(**overrides):
    values = {"day": DAY, "event_ids": frozenset({1, 2, 3})}
    return OptimisationRules(**{**values, **overrides})


def update(event_id, start="10:00", end="11:00", **extra):
    return {
        "action": "update",
        "id": event_id,
        "start_at": f"2026-08-02T{start}:00",
        "end_at": f"2026-08-02T{end}:00",
        "reason": "Better flow.",
        **extra,
    }


CREATE = {
    "action": "create",
    "name": "Cafe",
    "description": "Coffee",
    "address": "1 Rue",
    "start_at": "2026-08-02T15:00:00",
    "end_at": "2026-08-02T16:00:00",
    "category": "Cafe",
}


def test_valid_update_keeps_local_datetimes_and_reason():
    [change] = validate_optimisation_ops([update(1)], rules())

    assert change == {
        "action": "update",
        "id": 1,
        "start_at": datetime(2026, 8, 2, 10),
        "end_at": datetime(2026, 8, 2, 11),
        "reason": "Better flow.",
    }


def test_a_missing_action_means_update():
    item = update(1)
    del item["action"]

    assert len(validate_optimisation_ops([item], rules())) == 1


def test_locked_and_unknown_events_are_left_alone():
    ops = [update(1), update(2), update(99)]

    result = validate_optimisation_ops(ops, rules(locked_ids=frozenset({1})))

    assert [c["id"] for c in result] == [2]


def test_updates_on_another_day_or_ending_before_they_start_are_dropped():
    wrong_day = update(1, start="10:00") | {"start_at": "2026-08-03T10:00:00"}
    backwards = update(2, start="12:00", end="11:00")

    assert validate_optimisation_ops([wrong_day, backwards], rules()) == []


def test_times_outside_the_day_window_are_dropped():
    window = rules(day_start=time(9), day_end=time(18))
    ops = [
        update(1, "08:00", "09:30"),
        update(2, "17:00", "18:30"),
        update(3, "09:00", "18:00"),
    ]

    assert [c["id"] for c in validate_optimisation_ops(ops, window)] == [3]


def test_deleting_and_creating_need_permission():
    ops = [{"action": "delete", "id": 1, "reason": "x"}, CREATE]

    assert validate_optimisation_ops(ops, rules()) == []

    allowed = validate_optimisation_ops(ops, rules(allow_add_remove=True))
    assert [c["action"] for c in allowed] == ["delete", "create"]


def test_locked_events_cannot_be_deleted_even_when_removal_is_allowed():
    ops = [{"action": "delete", "id": 1}]

    result = validate_optimisation_ops(
        ops, rules(allow_add_remove=True, locked_ids=frozenset({1}))
    )

    assert result == []


def test_created_event_must_respect_the_window_and_be_well_formed():
    window = rules(allow_add_remove=True, day_end=time(15, 30))
    incomplete = dict(CREATE)
    del incomplete["address"]

    assert validate_optimisation_ops([CREATE, incomplete], window) == []


def test_non_list_reply_is_an_unusable_response():
    with pytest.raises(AIResponseError):
        validate_optimisation_ops({"action": "update"}, rules())


def test_junk_entries_are_skipped():
    assert (
        validate_optimisation_ops(["x", None, 5, {"action": "teleport"}], rules()) == []
    )

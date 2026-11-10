from datetime import datetime

from src.services.flight_context import FlightWindow
from src.utils.ai_output_validators import validate_event_suggestion

DAY = "2026-08-02"
FLIGHT = FlightWindow(
    label="BA304 LHR → CDG",
    departs=datetime(2026, 8, 2, 14),
    arrives=datetime(2026, 8, 2, 15, 20),
)  # blocks 11:00 to 17:20


def suggestion(start="09:00", end="10:00", **extra):
    return {
        "name": "Louvre",
        "description": "Museum",
        "address": "Rue de Rivoli, Paris",
        "start_at": f"{DAY}T{start}:00",
        "end_at": f"{DAY}T{end}:00",
        "category": "Museum",
        **extra,
    }


def test_a_well_formed_suggestion_on_the_day_is_valid():
    assert validate_event_suggestion(suggestion(), DAY)


def test_missing_fields_wrong_days_and_backwards_times_are_invalid():
    incomplete = suggestion()
    del incomplete["address"]
    next_day = suggestion() | {"start_at": "2026-08-03T09:00:00"}

    assert not validate_event_suggestion(incomplete, DAY)
    assert not validate_event_suggestion(next_day, DAY)
    assert not validate_event_suggestion(suggestion("11:00", "10:00"), DAY)
    assert not validate_event_suggestion("not a dict", DAY)


def test_a_suggestion_inside_a_flight_window_is_invalid():
    assert not validate_event_suggestion(
        suggestion("10:30", "12:00"), DAY, blocked=[FLIGHT]
    )
    assert not validate_event_suggestion(
        suggestion("16:00", "17:00"), DAY, blocked=[FLIGHT]
    )


def test_a_suggestion_clear_of_a_flight_window_is_valid():
    assert validate_event_suggestion(suggestion("09:00", "11:00"), DAY, [FLIGHT])
    assert validate_event_suggestion(suggestion("17:20", "18:30"), DAY, [FLIGHT])


def test_an_offset_the_model_adds_does_not_hide_a_clash():
    assert not validate_event_suggestion(
        suggestion(start_at=f"{DAY}T12:00:00Z", end_at=f"{DAY}T13:00:00Z"),
        DAY,
        blocked=[FLIGHT],
    )

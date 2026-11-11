import json
from datetime import date
from unittest.mock import patch

import pytest
from marshmallow import ValidationError
from src.exceptions import AIResponseError
from src.services.trip_prompt_service import (
    DEFAULT_LEAD_TIME,
    DEFAULT_TRIP_LENGTH,
    build_trip_brief_prompt,
    interpret_trip_prompt,
)

AI = "src.services.trip_prompt_service.get_ai_response"
TODAY = date(2026, 3, 1)


def interpret(reply, prompt="A trip"):
    body = reply if isinstance(reply, str) else json.dumps(reply)
    with patch(AI, return_value=body):
        return interpret_trip_prompt(prompt, TODAY)


def test_a_prompt_becomes_a_brief_with_the_facts_it_states():
    brief = interpret(
        {
            "name": "Lisbon food weekend",
            "destination": "Lisbon, Portugal",
            "start_date": "2026-06-05",
            "end_date": "2026-06-08",
            "budget_amount_gbp": 900,
            "preferences": {
                "trip_type": "couple",
                "group_size": 2,
                "vibes": ["foodie"],
                "pace": "relaxed",
            },
        }
    )

    assert brief.name == "Lisbon food weekend"
    assert brief.destination == "Lisbon, Portugal"
    assert brief.start_date == date(2026, 6, 5)
    assert brief.end_date == date(2026, 6, 8)
    assert brief.budget_amount_gbp == 900
    assert brief.preferences == {
        "trip_type": "couple",
        "group_size": 2,
        "vibes": ["foodie"],
        "pace": "relaxed",
    }


def test_missing_dates_fall_back_to_a_week_some_months_ahead():
    brief = interpret({"destination": "Rome"})

    assert brief.start_date == TODAY + DEFAULT_LEAD_TIME
    assert brief.end_date == brief.start_date + DEFAULT_TRIP_LENGTH


def test_an_end_date_before_the_start_gives_a_default_length_trip():
    brief = interpret(
        {"destination": "Rome", "start_date": "2026-06-10", "end_date": "2026-06-01"}
    )

    assert brief.end_date == date(2026, 6, 10) + DEFAULT_TRIP_LENGTH


def test_an_unnamed_trip_is_named_after_its_destination():
    assert interpret({"destination": "Rome"}).name == "Trip to Rome"


@pytest.mark.parametrize("destination", [None, "", "   "])
def test_a_prompt_without_a_destination_asks_for_one(destination):
    with pytest.raises(ValidationError) as error:
        interpret({"destination": destination})

    assert "prompt" in error.value.messages


def test_a_preference_the_trip_cannot_hold_is_dropped_and_the_rest_kept():
    brief = interpret(
        {
            "destination": "Rome",
            "preferences": {"pace": "frantic", "trip_type": "solo", "vibes": None},
        }
    )

    assert brief.preferences == {"trip_type": "solo"}


def test_a_negative_budget_is_ignored():
    assert (
        interpret({"destination": "Rome", "budget_amount_gbp": -5}).budget_amount_gbp
        is None
    )


def test_a_reply_that_is_not_an_object_is_rejected():
    with pytest.raises(AIResponseError):
        interpret("[1, 2]")


def test_the_prompt_carries_the_users_words_and_todays_date():
    prompt = build_trip_brief_prompt("Ten days in Kyoto", TODAY)

    assert "Ten days in Kyoto" in prompt
    assert "2026-03-01" in prompt

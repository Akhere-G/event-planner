from datetime import date, datetime

import pytest
from src.ai_entities.parsing import (
    as_int,
    as_list,
    as_object,
    clean_text,
    parse_date,
    parse_local_datetime,
    pick,
)


def test_only_an_object_is_an_object_and_only_a_list_is_a_list():
    assert as_object({"a": 1}) == {"a": 1}
    assert as_object([1]) is None
    assert as_list([1]) == [1]
    assert as_list({"a": 1}) is None


def test_a_boolean_is_not_an_integer():
    assert as_int(3) == 3
    assert as_int(True) is None
    assert as_int("3") is None


@pytest.mark.parametrize(
    ("value", "limit", "expected"),
    [
        (" Lunch ", None, "Lunch"),
        ("abcdef", 3, "abc"),
        ("  ", None, None),
        (4, None, None),
    ],
)
def test_clean_text_trims_cuts_and_rejects_blanks(value, limit, expected):
    assert clean_text(value, limit) == expected


def test_pick_keeps_only_the_named_fields_that_are_present():
    assert pick({"a": 1, "b": 2, "c": 3}, ("a", "c", "d")) == {"a": 1, "c": 3}


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("2026-08-02", date(2026, 8, 2)),
        ("2026-08-02T19:00:00", date(2026, 8, 2)),
        ("tomorrow", None),
        (None, None),
    ],
)
def test_parse_date(value, expected):
    assert parse_date(value) == expected


def test_a_local_time_ignores_any_offset_the_model_added():
    assert parse_local_datetime("2026-08-02T19:00:00Z") == datetime(2026, 8, 2, 19)
    assert parse_local_datetime("2026-08-02T19:00:00+05:00") == datetime(2026, 8, 2, 19)
    assert parse_local_datetime("7pm") is None
    assert parse_local_datetime(7) is None

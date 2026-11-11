from datetime import UTC, date, datetime

from src.services.flight_context import (
    FlightWindow,
    blocked_windows,
    format_flight_context,
    overlaps_any,
    windows_for_day,
)
from tests.factories import FlightFactory


def utc(day, hour, minute=0):
    return datetime(2026, 8, day, hour, minute, tzinfo=UTC)


def local(day, hour, minute=0):
    return datetime(2026, 8, day, hour, minute)


def window(departs, arrives, label="BA304 LHR → CDG"):
    return FlightWindow(label=label, departs=departs, arrives=arrives)


def test_a_flight_blocks_three_hours_before_departure_to_two_after_arrival():
    flight = window(local(1, 12), local(1, 14, 20))

    assert flight.start == local(1, 9)
    assert flight.end == local(1, 16, 20)


def test_blocked_windows_are_in_trip_local_time(itinerary):
    FlightFactory(itinerary=itinerary, depart_at=utc(1, 10), arrive_at=utc(1, 12, 20))

    [flight] = blocked_windows(itinerary.id, itinerary.timezone)

    assert flight.label.endswith(" LHR → CDG")
    assert flight.departs == local(1, 12)  # Paris is UTC+2 in August
    assert flight.arrives == local(1, 14, 20)


def test_no_flights_means_no_windows(itinerary):
    assert blocked_windows(itinerary.id, itinerary.timezone) == []


def test_an_overnight_flight_blocks_both_days_it_spans():
    overnight = window(local(1, 21), local(2, 5))

    assert overnight.touches(date(2026, 8, 1))
    assert overnight.touches(date(2026, 8, 2))
    assert not overnight.touches(date(2026, 8, 3))


def test_the_pre_departure_buffer_can_reach_back_into_the_previous_day():
    early = window(local(2, 1), local(2, 3))

    assert early.touches(date(2026, 8, 1))
    assert early.touches(date(2026, 8, 2))


def test_the_post_arrival_buffer_can_reach_into_the_next_day():
    late = window(local(1, 21), local(1, 23, 30))

    assert late.touches(date(2026, 8, 2))
    assert not window(local(1, 20), local(1, 21)).touches(date(2026, 8, 2))


def test_windows_for_day_keeps_only_the_flights_that_touch_it():
    morning = window(local(1, 12), local(1, 14))
    later = window(local(3, 12), local(3, 14), label="BA305 CDG → LHR")

    assert windows_for_day([morning, later], date(2026, 8, 3)) == [later]
    assert windows_for_day([morning, later], date(2026, 8, 2)) == []


def test_an_event_overlapping_the_blocked_time_is_rejected():
    flight = window(local(1, 12), local(1, 14))  # blocked 09:00 to 16:00

    assert overlaps_any([flight], local(1, 8), local(1, 9, 30))
    assert overlaps_any([flight], local(1, 15), local(1, 17))
    assert overlaps_any([flight], local(1, 10), local(1, 11))


def test_an_event_that_only_touches_the_blocked_time_is_allowed():
    flight = window(local(1, 12), local(1, 14))

    assert not overlaps_any([flight], local(1, 7), local(1, 9))
    assert not overlaps_any([flight], local(1, 16), local(1, 18))
    assert not overlaps_any([], local(1, 10), local(1, 11))


def test_the_prompt_lists_each_flight_with_its_blocked_time():
    flights = [
        window(local(1, 12), local(1, 14, 20)),
        window(local(5, 18), local(5, 19, 30), label="BA305 CDG → LHR"),
    ]

    assert format_flight_context(flights) == (
        "- BA304 LHR → CDG: flies 2026-08-01T12:00 to 2026-08-01T14:20; "
        "blocked 2026-08-01T09:00 to 2026-08-01T16:20\n"
        "- BA305 CDG → LHR: flies 2026-08-05T18:00 to 2026-08-05T19:30; "
        "blocked 2026-08-05T15:00 to 2026-08-05T21:30"
    )
    assert format_flight_context([]) == ""

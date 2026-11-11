from datetime import datetime

from src.services.flight_context import FlightWindow
from src.services.trip_edit.registry import build_editors
from src.services.trip_edit.prompt import MAX_HISTORY_MESSAGES, build_edit_prompt
from tests.factories import edit_context


def build(itinerary, message="Move dinner", history=(), flights=()):
    editors = build_editors(edit_context(itinerary, flights=flights))
    return build_edit_prompt(itinerary, editors, list(flights), message, list(history))


def test_the_prompt_lists_the_days_and_the_trips_items_with_their_ids(itinerary, event):
    prompt = build(itinerary)

    assert "Day 1 = 2026-08-01 (Saturday)" in prompt
    assert "Day 3 = 2026-08-03" in prompt
    assert f"- id={event.id} | {event.name}" in prompt
    assert "PACKING ITEMS:\n- none" in prompt
    assert "Europe/Paris" in prompt


def test_the_request_and_history_are_delimited_as_data(itinerary):
    history = [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello"},
    ]

    prompt = build(itinerary, "Swap the museum", history)

    assert "<<<\nSwap the museum\n>>>" in prompt
    assert "<<<\nUser: Hi\nAssistant: Hello\n>>>" in prompt


def test_only_the_latest_history_is_sent(itinerary):
    history = []
    for number in range(MAX_HISTORY_MESSAGES + 3):
        history.append({"role": "user", "content": f"turn {number}"})

    prompt = build(itinerary, history=history)

    assert "turn 2\n" not in prompt
    assert "turn 3\n" in prompt


def test_flights_are_only_mentioned_when_there_are_some(itinerary):
    flight = FlightWindow(
        "BA123 LHR → CDG", datetime(2026, 8, 2, 20, 0), datetime(2026, 8, 2, 22, 0)
    )

    assert "FLIGHTS" not in build(itinerary).split("RULES")[0]
    assert "BA123 LHR → CDG" in build(itinerary, flights=[flight])


def test_the_format_names_every_entity_and_its_fields(itinerary):
    prompt = build(itinerary)

    assert "event | accommodation | packing_item | wishlist | wishlist_item" in prompt
    assert "- wishlist_item: name, description; address and wishlist_name" in prompt


def test_an_editors_notes_are_added_to_the_prompt(itinerary):
    prompt = build(itinerary)

    assert "NOTES ON SPECIFIC ITEMS:" in prompt
    assert "- wishlist: removing a list removes its items too" in prompt


def test_the_people_are_listed_for_editors_that_name_them(
    itinerary, admin_user, editor_user
):
    members = {admin_user.id: admin_user.username, editor_user.id: editor_user.username}
    context = edit_context(itinerary, admin_user.id, "admin", members=members)

    prompt = build_edit_prompt(itinerary, build_editors(context), [], "Add lunch", [])

    assert f"- id={editor_user.id} | {editor_user.username}" in prompt
    assert f"The requester is person {admin_user.id}" in prompt
    assert "The requester is an admin." in prompt


def test_the_people_are_left_out_when_no_editor_needs_them(itinerary):
    assert "PEOPLE ON THIS TRIP" not in build(itinerary)

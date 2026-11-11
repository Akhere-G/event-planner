from decimal import Decimal

import pytest
from src.services.trip_edit.registry import build_editors
from src.services.trip_edit.trip_editor import TripEditor
from tests.factories import edit_context


def trip_editor(itinerary, user, role="admin"):
    return TripEditor(edit_context(itinerary, user_id=user.id, role=role))


def test_only_an_admin_is_offered_the_trip(itinerary, admin_user):
    assert TripEditor.is_available(edit_context(itinerary, role="admin"))
    assert not TripEditor.is_available(edit_context(itinerary, role="editor"))
    assert "trip" in build_editors(edit_context(itinerary, role="admin"))
    assert "trip" not in build_editors(edit_context(itinerary, role="editor"))


def test_the_trip_is_described_by_its_dates_and_budget(itinerary, admin_user):
    itinerary.budget_amount_gbp = Decimal("1200.00")

    lines = trip_editor(itinerary, admin_user).lines()

    assert lines == [
        f"- id={itinerary.id} | Trip dates and budget | start_date 2026-08-01 | "
        "end_date 2026-08-03 | budget_amount_gbp 1200.00"
    ]


def test_a_trip_without_a_budget_says_so(itinerary, admin_user):
    itinerary.budget_amount_gbp = None

    assert "budget_amount_gbp none" in trip_editor(itinerary, admin_user).lines()[0]


def test_a_trip_can_only_be_updated(itinerary, admin_user):
    assert trip_editor(itinerary, admin_user).kinds == ("update",)


def test_new_dates_are_accepted_when_they_stay_in_order(itinerary, admin_user):
    editor = trip_editor(itinerary, admin_user)
    both = {"start_date": "2026-09-01", "end_date": "2026-09-05"}

    assert editor.normalise("update", itinerary.id, both) == both
    assert editor.normalise("update", itinerary.id, {"end_date": "2026-08-10"})
    assert editor.normalise("update", itinerary.id, {"budget_amount_gbp": None})


@pytest.mark.parametrize(
    "data",
    [
        {"start_date": "2026-08-10"},
        {"end_date": "2026-07-30"},
        {"start_date": "2026-09-05", "end_date": "2026-09-01"},
        {"start_date": "next friday"},
        {"end_date": 20260905},
    ],
)
def test_dates_that_leave_the_trip_backwards_or_unreadable_are_rejected(
    itinerary, admin_user, data
):
    assert (
        trip_editor(itinerary, admin_user).normalise("update", itinerary.id, data)
        is None
    )

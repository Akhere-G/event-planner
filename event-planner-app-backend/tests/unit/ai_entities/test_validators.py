from datetime import date, datetime, time
from unittest.mock import patch

import pytest

from src.ai_entities.context import Requester, TimeRules, ValidationContext
from src.ai_entities.describers.base import EntityDescription
from src.ai_entities.places import Place, PlaceResolver
from src.ai_entities.validators.factory import EntityValidatorFactory
from src.models import UserRole
from src.services.flight_context import FlightWindow

LOUVRE = Place(48.86, 2.33, "Rue de Rivoli, Paris")
EDITOR = Requester(user_id=1, role=UserRole.EDITOR.value, members={1: "Ann", 2: "Bo"})
ADMIN = Requester(user_id=1, role=UserRole.ADMIN.value, members={1: "Ann", 2: "Bo"})
ANONYMOUS = Requester(None, None, {})


class FixedPlaces(PlaceResolver):
    def __init__(self, place: Place | None = LOUVRE) -> None:
        super().__init__()
        self.place = place
        self.lookups: list[str] = []

    def resolve(self, name, address, place_type="establishment"):
        self.lookups.append(name)
        return self.place


def validator(entity, requester=EDITOR, existing=None, **context):
    context.setdefault("places", FixedPlaces())
    return EntityValidatorFactory.create(
        entity,
        ValidationContext("Europe/Paris", requester, **context),
        existing,
    )


def described(entity_id, label="Saved", **values):
    return {entity_id: EntityDescription(entity_id, label, "", values)}


def available_entities(requester):
    entities = []
    for found in EntityValidatorFactory.available_for(requester):
        entities.append(found.entity)
    return entities


def test_the_factory_rejects_an_unknown_entity():
    with pytest.raises(ValueError):
        validator("nonsense")


def test_entities_a_requester_may_not_touch_are_not_offered():
    assert "trip" not in available_entities(EDITOR)
    assert "trip" in available_entities(ADMIN)
    assert "expense" in available_entities(EDITOR)
    assert "expense" not in available_entities(ANONYMOUS)


def test_only_the_allowed_fields_survive_and_non_objects_are_dropped():
    packing = validator("packing_item")

    checked = packing.validate_create(
        {"name": " Socks ", "owner_id": 9, "category": "Clothes"}
    )

    assert checked == {"name": "Socks", "category": "Clothes", "is_shared": True}
    assert packing.validate_create("socks") is None
    assert packing.validate_create({"category": "x"}) is None


def test_an_edit_of_an_entity_the_trip_does_not_have_is_dropped():
    packing = validator("packing_item", existing=described(5))

    assert packing.validate_edit(5, {"name": "Hat"}) == {"name": "Hat"}
    assert packing.validate_edit(6, {"name": "Hat"}) is None
    assert packing.validate_edit(5, {"colour": "red"}) is None


EVENT = {
    "name": "Louvre",
    "category": "Museum",
    "start_at": "2026-08-02T10:00:00",
    "end_at": "2026-08-02T12:00:00",
    "address": "Rue de Rivoli",
}
HOTEL = {"name": "Hotel", "start_date": "2026-08-01", "end_date": "2026-08-04"}
PAYMENT = {"from_user_id": 1, "to_user_id": 2, "amount_gbp": 5}


class TestEvent:
    def test_a_create_gets_utc_times_and_a_place(self):
        checked = validator("event").validate_create(EVENT)

        assert checked == {
            "name": "Louvre",
            "category": "Museum",
            "start_at": "2026-08-02T08:00:00+00:00",
            "end_at": "2026-08-02T10:00:00+00:00",
            "address": "Rue de Rivoli, Paris",
            "latitude": 48.86,
            "longitude": 2.33,
        }

    def test_an_offset_the_model_adds_is_ignored(self):
        raw = {**EVENT, "start_at": "2026-08-02T10:00:00Z"}

        checked = validator("event").validate_create(raw)

        assert checked["start_at"] == "2026-08-02T08:00:00+00:00"

    def test_long_text_is_cut_to_what_an_event_holds(self):
        raw = {**EVENT, "name": "n" * 150, "category": "c" * 20}

        checked = validator("event").validate_create(raw)

        assert len(checked["name"]) == 100
        assert checked["category"] == "c" * 10

    @pytest.mark.parametrize(
        "times",
        [
            {"start_at": "2026-08-02T10:00:00"},
            {"start_at": "2026-08-02T12:00:00", "end_at": "2026-08-02T10:00:00"},
            {"start_at": "tonight", "end_at": "later"},
            {"start_at": 10, "end_at": 12},
        ],
    )
    def test_bad_times_are_dropped(self, times):
        raw = {"name": "Louvre", "category": "Museum", **times}

        assert validator("event").validate_create(raw) is None

    def test_an_unfindable_place_drops_the_create(self):
        events = validator("event", places=FixedPlaces(None))

        assert events.validate_create(EVENT) is None

    def test_a_time_inside_a_flight_window_is_dropped(self):
        flight = FlightWindow(
            "BA1", datetime(2026, 8, 2, 12, 0), datetime(2026, 8, 2, 14, 0)
        )

        assert validator("event", flights=[flight]).validate_create(EVENT) is None

    def test_time_rules_keep_an_event_to_its_days_and_hours(self):
        rules = TimeRules(frozenset({date(2026, 8, 2)}), time(9), time(20))
        late = {**EVENT, "end_at": "2026-08-02T21:00:00"}
        next_day = {**EVENT, "end_at": "2026-08-03T01:00:00"}
        other_day = {
            **EVENT,
            "start_at": "2026-08-03T10:00:00",
            "end_at": "2026-08-03T11:00:00",
        }
        events = validator("event", time_rules=rules)

        assert events.validate_create(EVENT) is not None
        for raw in (late, next_day, other_day):
            assert events.validate_create(raw) is None

    def test_an_edit_that_keeps_the_address_keeps_the_saved_place(self):
        places = FixedPlaces()
        saved = described(3, "Louvre", address="Rue de Rivoli")
        events = validator("event", existing=saved, places=places)
        raw = {
            "address": "Rue de Rivoli",
            "start_at": "2026-08-02T10:00:00",
            "end_at": "2026-08-02T11:00:00",
        }

        checked = events.validate_edit(3, raw)

        assert "latitude" not in checked
        assert "address" not in checked
        assert places.lookups == []

    def test_an_edit_that_changes_the_address_finds_the_new_place(self):
        places = FixedPlaces()
        saved = described(3, "Louvre", address="Old street")
        events = validator("event", existing=saved, places=places)

        checked = events.validate_edit(3, {"address": "Rue de Rivoli"})

        assert checked["latitude"] == 48.86
        assert places.lookups == ["Louvre"]

    def test_an_edit_that_leaves_the_address_alone_looks_nothing_up(self):
        places = FixedPlaces()
        events = validator("event", existing=described(3, address="X"), places=places)

        assert events.validate_edit(3, {"name": "Brunch"}) == {"name": "Brunch"}
        assert places.lookups == []

    def test_an_edit_with_one_time_is_dropped(self):
        events = validator("event", existing=described(3, address="X"))

        assert events.validate_edit(3, {"start_at": "2026-08-02T10:00:00"}) is None


class TestAccommodation:
    def test_a_create_gets_a_place(self):
        checked = validator("accommodation").validate_create(HOTEL)

        assert checked["latitude"] == 48.86
        assert checked["address"] == "Rue de Rivoli, Paris"

    def test_backwards_or_missing_dates_are_dropped(self):
        accommodations = validator("accommodation")
        backwards = {**HOTEL, "end_date": "2026-07-30"}
        garbage = {**HOTEL, "start_date": "soon"}

        for raw in (backwards, garbage, {"name": "Hotel"}):
            assert accommodations.validate_create(raw) is None

    def test_an_edit_is_checked_against_the_saved_dates(self):
        saved = described(
            4, address="A", start_date="2026-08-01", end_date="2026-08-04"
        )
        accommodations = validator("accommodation", existing=saved)

        assert accommodations.validate_edit(4, {"end_date": "2026-08-06"})
        assert accommodations.validate_edit(4, {"end_date": "2026-07-20"}) is None


class TestWishlists:
    def test_a_name_that_is_already_taken_is_dropped(self):
        wishlists = validator("wishlist", existing=described(1, name="Food"))

        assert wishlists.validate_create({"name": " food "}) is None
        assert wishlists.validate_create({"name": " Museums "}) == {"name": "Museums"}
        assert wishlists.validate_edit(1, {"name": 5}) is None

    def test_an_item_keeps_going_when_its_place_cannot_be_found(self):
        items = validator("wishlist_item", places=FixedPlaces(None))

        assert items.validate_create({"name": "Cafe"}) == {"name": "Cafe"}

    def test_an_item_gets_the_place_it_names(self):
        checked = validator("wishlist_item").validate_create({"name": "Louvre"})

        assert checked["longitude"] == 2.33


class TestTrip:
    saved = described(1, start_date="2026-08-01", end_date="2026-08-10")

    def test_the_trip_can_only_be_updated(self):
        assert validator("trip").kinds == ("update",)

    def test_dates_must_still_run_forwards_against_the_saved_ones(self):
        trip = validator("trip", ADMIN, self.saved)

        assert trip.validate_edit(1, {"end_date": "2026-08-12"})
        assert trip.validate_edit(1, {"end_date": "2026-07-30"}) is None
        assert trip.validate_edit(1, {"start_date": "2026-08-11"}) is None
        assert trip.validate_edit(1, {"budget_amount_gbp": None}) == {
            "budget_amount_gbp": None
        }


class TestExpense:
    def test_a_create_is_tidied_and_given_todays_date(self):
        raw = {
            "description": "Taxi",
            "amount": 12,
            "category": " Transport ",
            "currency": "eur",
            "notes": "x",
            "split_type": "even_all",
            "participant_ids": [1],
            "paid_by_id": None,
        }

        with patch(
            "src.ai_entities.validators.money.utcnow",
            return_value=datetime(2026, 8, 2, 9, 0),
        ):
            checked = validator("expense").validate_create(raw)

        assert checked == {
            "description": "Taxi",
            "amount": 12,
            "category": "transport",
            "currency": "EUR",
            "split_type": "even_all",
            "spent_on": "2026-08-02",
        }

    def test_a_selected_split_needs_people_who_are_members(self):
        expenses = validator("expense")
        base = {"description": "Taxi", "amount": 12, "split_type": "selected"}

        assert expenses.validate_create(base) is None
        assert expenses.validate_create({**base, "participant_ids": [9]}) is None
        assert expenses.validate_create({**base, "participant_ids": [1, 2]})

    def test_only_an_admin_may_name_someone_else_as_payer(self):
        raw = {"description": "Taxi", "amount": 12, "paid_by_id": 2}

        assert validator("expense", EDITOR).validate_create(raw) is None
        assert validator("expense", ADMIN).validate_create(raw)
        assert validator("expense", EDITOR).validate_create({**raw, "paid_by_id": 1})

    def test_a_payer_may_stay_as_they_are_on_an_edit(self):
        expenses = validator("expense", EDITOR, described(7, paid_by_id=2))

        assert expenses.validate_edit(7, {"paid_by_id": 2})
        assert expenses.validate_edit(7, {"paid_by_id": 1})


class TestSettlement:
    def test_a_create_defaults_the_date(self):
        assert validator("settlement").validate_create(PAYMENT)["settled_on"]

    def test_the_parties_must_be_different_members(self):
        settlements = validator("settlement")

        assert settlements.validate_create({**PAYMENT, "to_user_id": 1}) is None
        assert settlements.validate_create({**PAYMENT, "to_user_id": 9}) is None

    def test_only_an_admin_records_other_peoples_payments(self):
        other = {**PAYMENT, "from_user_id": 2, "to_user_id": 1}

        assert validator("settlement", EDITOR).validate_create(other) is None
        assert validator("settlement", ADMIN).validate_create(other)

    def test_an_edit_is_checked_against_the_saved_parties(self):
        saved = described(3, from_user_id=1, to_user_id=2)
        settlements = validator("settlement", existing=saved)

        assert settlements.validate_edit(3, {"amount_gbp": 9})
        assert settlements.validate_edit(3, {"to_user_id": 1}) is None


def test_a_packing_item_gets_the_applier_defaults_and_trimmed_values():
    packing = validator("packing_item")

    checked = packing.validate_create({"name": "n" * 150, "is_shared": False})

    assert checked == {"name": "n" * 100, "is_shared": False, "category": "General"}


def test_an_edit_may_only_change_the_times_it_is_given_and_keeps_to_the_window():
    rules = TimeRules(frozenset({date(2026, 8, 2)}), time(9), time(20))
    events = validator("event", existing=described(3, address="X"), time_rules=rules)
    inside = {"start_at": "2026-08-02T10:00:00", "end_at": "2026-08-02T11:00:00"}
    too_late = {"start_at": "2026-08-02T19:00:00", "end_at": "2026-08-02T21:00:00"}

    assert events.validate_edit(3, inside)
    assert events.validate_edit(3, too_late) is None
    assert events.validate_edit(4, inside) is None

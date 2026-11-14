from datetime import UTC, date, datetime

import pytest
from marshmallow import ValidationError
from sqlalchemy import select
from src.exceptions import TemplateNotFoundError, UserNotAuthorisedError
from src.extensions import db
from src.models import Event, Itinerary, ItineraryUser, TripTemplate, UserRole
from src.services.template_clone_service import clone_template, materialise_ops
from src.services.template_service import (
    get_public_template,
    list_template_pins,
    list_templates,
    publish_itinerary,
    unpublish_itinerary,
)
from src.utils.trip_time import to_trip_local
from tests.factories import EventFactory, UserFactory

pytestmark = pytest.mark.usefixtures("clean_templates")


def relative_event(name="Dinner", day_offset=0, start="19:00", end="21:00"):
    return {
        "op": "create",
        "entity": "event",
        "data": {
            "name": name,
            "description": None,
            "address": "1 Rue Cler, Paris",
            "latitude": 48.85,
            "longitude": 2.30,
            "category": "Food",
            "day_offset": day_offset,
            "start_time": start,
            "end_day_offset": day_offset,
            "end_time": end,
        },
    }


def make_template(slug="paris-3-days-itinerary", **overrides):
    template = TripTemplate(
        slug=slug,
        title="Paris",
        description="Three days in Paris",
        destination="Paris, France",
        region="Europe",
        latitude=48.8566,
        longitude=2.3522,
        timezone="Europe/Paris",
        duration_days=3,
        is_public=True,
        clone_count=0,
        ops=[relative_event()],
    )
    for name, value in overrides.items():
        setattr(template, name, value)
    db.session.add(template)
    db.session.flush()
    return template


def in_range_event(itinerary, creator):
    return EventFactory(
        itinerary=itinerary,
        creator=creator,
        start_at=datetime(2026, 8, 1, 10, 0, tzinfo=UTC),
        end_at=datetime(2026, 8, 1, 12, 0, tzinfo=UTC),
    )


def test_publish_creates_a_template_with_a_random_slug(itinerary, admin_user):
    in_range_event(itinerary, admin_user)

    template = publish_itinerary(itinerary.id, admin_user.id, "Europe", None, None)

    assert len(template.slug) == 32
    assert template.region == "Europe"
    assert template.title == itinerary.name
    assert template.author_id == admin_user.id
    assert template.duration_days == 3
    assert template.is_public is True


def test_republish_keeps_the_slug_and_refreshes_the_ops(itinerary, admin_user):
    in_range_event(itinerary, admin_user)
    first = publish_itinerary(itinerary.id, admin_user.id, "Europe", "Old title", None)
    EventFactory(
        itinerary=itinerary,
        creator=admin_user,
        name="Late addition",
        start_at=datetime(2026, 8, 2, 10, 0, tzinfo=UTC),
        end_at=datetime(2026, 8, 2, 11, 0, tzinfo=UTC),
    )
    db.session.refresh(itinerary)

    second = publish_itinerary(itinerary.id, admin_user.id, "Asia", "New title", None)

    assert second.id == first.id
    assert second.slug == first.slug
    assert (second.title, second.region) == ("New title", "Asia")
    assert len(second.ops) == 2


def test_unpublished_templates_are_hidden(itinerary, admin_user):
    in_range_event(itinerary, admin_user)
    template = publish_itinerary(itinerary.id, admin_user.id, "Europe", None, None)

    unpublish_itinerary(itinerary.id)

    with pytest.raises(TemplateNotFoundError):
        get_public_template(template.slug)
    assert list_templates(None, [], 12, 0)[1] == 0


def test_unpublishing_an_unpublished_trip_is_not_found(itinerary):
    with pytest.raises(TemplateNotFoundError):
        unpublish_itinerary(itinerary.id)


def test_list_filters_by_region_and_search(app):
    make_template("paris", title="Paris", destination="Paris, France")
    make_template("tokyo", title="Tokyo", destination="Tokyo, Japan", region="Asia")
    make_template("rome", title="Rome", destination="Rome, Italy", clone_count=5)

    europe, total = list_templates(None, ["Europe"], 12, 0)
    assert total == 2
    assert [template.slug for template, _ in europe] == ["rome", "paris"]

    assert list_templates("japan", [], 12, 0)[1] == 1
    assert list_templates("100%", [], 12, 0)[1] == 0


def test_list_paginates(app):
    for index in range(3):
        make_template(f"trip-{index}")

    page, total = list_templates(None, [], 2, 2)

    assert total == 3
    assert len(page) == 1


def test_pins_cover_every_match_without_pagination(app):
    for index in range(15):
        make_template(f"trip-{index}")
    make_template("hidden", is_public=False)

    pins = list_template_pins(None, [])

    assert len(pins) == 15
    assert set(pins[0]._mapping) == {
        "slug",
        "title",
        "destination",
        "region",
        "latitude",
        "longitude",
    }


def test_materialise_converts_local_times_across_a_dst_boundary():
    ops = [
        relative_event("Before", day_offset=0),
        relative_event("After", day_offset=1),
    ]

    absolute = materialise_ops(ops, date(2026, 3, 28), "Europe/Paris")

    assert absolute[0]["data"]["start_at"] == "2026-03-28T18:00:00Z"
    assert absolute[1]["data"]["start_at"] == "2026-03-29T17:00:00Z"
    assert "day_offset" not in absolute[0]["data"]


def test_materialise_shifts_accommodation_dates():
    ops = [
        {
            "op": "create",
            "entity": "accommodation",
            "data": {
                "name": "Hotel",
                "description": None,
                "address": "1 Rue",
                "latitude": 1.0,
                "longitude": 2.0,
                "start_day_offset": 0,
                "end_day_offset": 3,
            },
        }
    ]

    accomodation = materialise_ops(ops, date(2027, 1, 30), None)[0]["data"]

    assert (accomodation["start_date"], accomodation["end_date"]) == (
        "2027-01-30",
        "2027-02-02",
    )


def test_clone_keeps_local_times_across_a_dst_boundary(app):
    user = UserFactory()
    template = make_template(
        duration_days=2,
        ops=[
            relative_event("Before", day_offset=0),
            relative_event("After", day_offset=1),
        ],
    )

    itinerary = clone_template(template.slug, user.id, date(2026, 3, 28))

    events = (
        db.session.execute(select(Event).where(Event.itinerary_id == itinerary.id))
        .scalars()
        .all()
    )
    local = {
        event.name: to_trip_local(event.start_at, itinerary.timezone)
        for event in events
    }
    assert local["Before"] == datetime(2026, 3, 28, 19, 0)
    assert local["After"] == datetime(2026, 3, 29, 19, 0)


def test_clone_creates_an_admin_trip_on_the_chosen_dates(app):
    user = UserFactory()
    template = make_template()

    itinerary = clone_template(template.slug, user.id, date(2026, 10, 1))

    assert itinerary.name == "Paris"
    assert (itinerary.start_date, itinerary.end_date) == (
        date(2026, 10, 1),
        date(2026, 10, 3),
    )
    membership = db.session.execute(
        select(ItineraryUser).where(ItineraryUser.itinerary_id == itinerary.id)
    ).scalar_one()
    assert (membership.user_id, membership.role) == (user.id, UserRole.ADMIN.value)
    assert itinerary.created_by_id == user.id
    assert template.clone_count == 1


def test_a_failed_clone_leaves_nothing_behind(app):
    user = UserFactory()
    bad_event = relative_event()
    bad_event["data"]["address"] = None
    template = make_template(title="Doomed trip", ops=[bad_event])

    with pytest.raises(ValidationError):
        clone_template(template.slug, user.id, date(2026, 10, 1))

    trips = db.session.execute(
        select(Itinerary).where(Itinerary.name == "Doomed trip")
    ).all()
    assert trips == []


def test_demo_users_cannot_clone(app):
    demo = UserFactory(is_demo=True)
    template = make_template()

    with pytest.raises(UserNotAuthorisedError):
        clone_template(template.slug, demo.id, date(2026, 10, 1))

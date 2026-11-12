from contextlib import contextmanager
from datetime import date

import pytest
from sqlalchemy import event as sa_event
from src.extensions import db
from src.models import Accommodation, Expense, ExpenseShare

from tests.factories import (
    EventFactory,
    ExpenseFactory,
    ExpenseShareFactory,
    FlightFactory,
)

TRIP_DAY = date(2026, 8, 1)


@contextmanager
def count_selects():
    """Collects the SELECT statements the session runs inside the block."""
    statements: list[str] = []

    def record(conn, cursor, statement, *args):
        if statement.lstrip().upper().startswith("SELECT"):
            statements.append(statement)

    bind = db.session.get_bind()
    sa_event.listen(bind, "before_cursor_execute", record)
    try:
        yield statements
    finally:
        sa_event.remove(bind, "before_cursor_execute", record)


def add_expense(itinerary, members, **link):
    expense = ExpenseFactory(itinerary=itinerary, paid_by=members[0].user, **link)
    for member in members:
        ExpenseShareFactory(
            expense=expense,
            user=member.user,
            amount_gbp=expense.amount / len(members),
        )
    return expense


@pytest.fixture
def members(admin_itinerary_user, editor_itinerary_user, viewer_itinerary_user):
    return [admin_itinerary_user, editor_itinerary_user, viewer_itinerary_user]


def make_events(itinerary, admin_user, members, count):
    events = [
        EventFactory(itinerary=itinerary, creator=admin_user) for _ in range(count)
    ]
    for event in events:
        add_expense(itinerary, members, event_id=event.id)
    return events


def make_accommodations(itinerary, admin_user, members, count):
    stays = [
        Accommodation(
            itinerary_id=itinerary.id,
            name=f"Stay {n}",
            address="1 Street",
            latitude=1.0,
            longitude=2.0,
            start_date=TRIP_DAY,
            end_date=TRIP_DAY,
            created_by_id=admin_user.id,
            updated_by_id=admin_user.id,
        )
        for n in range(count)
    ]
    db.session.add_all(stays)
    db.session.flush()
    for accommodation in stays:
        add_expense(itinerary, members, accommodation_id=accommodation.id)
    return stays


def make_flights(itinerary, admin_user, members, count):
    flights = [
        FlightFactory(itinerary=itinerary, creator=admin_user) for _ in range(count)
    ]
    for flight in flights:
        add_expense(itinerary, members, flight_id=flight.id)
    return flights


def events_url(itinerary):
    return f"/api/itineraries/{itinerary.id}/events"


def accommodations_url(itinerary):
    return f"/api/itineraries/{itinerary.id}/accommodations"


def flights_url(itinerary):
    return f"/api/itineraries/{itinerary.id}/flights"


def events_payload(response):
    return response.get_json()["data"]["events"]


def list_payload(response):
    return response.get_json()["data"]


CASES = {
    "events": (make_events, events_url, events_payload),
    "accommodations": (make_accommodations, accommodations_url, list_payload),
    "flights": (make_flights, flights_url, list_payload),
}


@pytest.mark.parametrize("name", CASES)
def test_listing_embeds_each_items_expense_with_its_shares(
    admin_client, itinerary, admin_user, members, name
):
    make, url, payload = CASES[name]
    make(itinerary, admin_user, members, 2)

    items = payload(admin_client.get(url(itinerary)))

    assert len(items) == 2
    for item in items:
        assert item["expense"]["amountGbp"] == 30
        assert item["expense"]["paidBy"]["id"] == members[0].user_id
        assert len(item["expense"]["shares"]) == 3


@pytest.mark.parametrize("name", CASES)
def test_item_without_an_expense_has_null(
    admin_client, itinerary, admin_user, members, name
):
    make, url, payload = CASES[name]
    make(itinerary, admin_user, members, 1)
    db.session.query(ExpenseShare).delete()
    db.session.query(Expense).delete()
    db.session.flush()

    [item] = payload(admin_client.get(url(itinerary)))

    assert item["expense"] is None


@pytest.mark.parametrize("name", CASES)
def test_listing_query_count_does_not_grow_with_the_number_of_items(
    admin_client, itinerary, admin_user, members, name
):
    make, url, payload = CASES[name]
    make(itinerary, admin_user, members, 1)
    admin_client.get(url(itinerary))  # warm per-request caches such as the session user

    with count_selects() as one:
        admin_client.get(url(itinerary))
    make(itinerary, admin_user, members, 9)
    with count_selects() as ten:
        response = admin_client.get(url(itinerary))

    assert len(payload(response)) == 10
    assert len(ten) == len(one)


def test_single_event_and_accommodation_and_flight_embed_the_expense(
    admin_client, itinerary, admin_user, members
):
    [event] = make_events(itinerary, admin_user, members, 1)
    [accommodation] = make_accommodations(itinerary, admin_user, members, 1)
    [flight] = make_flights(itinerary, admin_user, members, 1)

    assert (
        admin_client.get(
            f"{accommodations_url(itinerary)}/{accommodation.id}"
        ).get_json()["data"]["expense"]["accommodationId"]
        == accommodation.id
    )
    assert (
        admin_client.get(f"{flights_url(itinerary)}/{flight.id}").get_json()["data"][
            "expense"
        ]["flightId"]
        == flight.id
    )
    assert (
        events_payload(admin_client.get(events_url(itinerary)))[0]["expense"]["eventId"]
        == event.id
    )


def test_updating_an_event_returns_its_expense(
    admin_client, itinerary, admin_user, members
):
    [event] = make_events(itinerary, admin_user, members, 1)

    response = admin_client.patch(
        f"{events_url(itinerary)}/{event.id}", json={"name": "Renamed"}
    )

    data = response.get_json()["data"]
    assert data["name"] == "Renamed"
    assert data["expense"]["eventId"] == event.id

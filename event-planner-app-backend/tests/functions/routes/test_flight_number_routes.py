from datetime import date, timedelta
from urllib.parse import urlencode

import pytest
from src.extensions import db
from src.models import Expense, Flight

DEPARTURE_DATE = (date.today() + timedelta(days=30)).isoformat()


@pytest.fixture(autouse=True)
def use_fake_provider(flight_number_provider):
    return flight_number_provider


def url(itinerary):
    return f"/api/itineraries/{itinerary.id}/flights/by-number"


def search_url(itinerary, **params):
    params = {"flightCode": "KL1000", "departureDate": DEPARTURE_DATE, **params}
    return f"{url(itinerary)}?{urlencode(params)}"


def payload(**overrides):
    data = {
        "flightCode": "KL1000",
        "departureDate": DEPARTURE_DATE,
        "notes": "Window",
    }
    data.update(overrides)
    return data


def saved_flights(itinerary):
    return (
        db.session.query(Flight)
        .filter_by(itinerary_id=itinerary.id)
        .order_by(Flight.depart_at)
        .all()
    )


def test_search_returns_one_journey_with_every_leg(
    editor_client, itinerary, flight_number_provider
):
    response = editor_client.get(search_url(itinerary))

    assert response.status_code == 200
    [journey] = response.get_json()["data"]
    assert journey["stops"] == 1
    assert journey["priceGbp"] is None
    first, second = journey["legs"]
    assert (first["departureAirport"], first["arrivalAirport"]) == ("LHR", "AMS")
    assert (second["departureAirport"], second["arrivalAirport"]) == ("AMS", "JFK")
    assert flight_number_provider.lookups == [
        ("KL", "1000", date.fromisoformat(DEPARTURE_DATE))
    ]


@pytest.mark.parametrize("code", ["kl1000", "KL 1000", " kl1000 "])
def test_search_normalises_the_flight_code(
    editor_client, itinerary, flight_number_provider, code
):
    response = editor_client.get(search_url(itinerary, flightCode=code))

    assert response.status_code == 200
    assert flight_number_provider.lookups[0][:2] == ("KL", "1000")


def test_search_is_cached(editor_client, itinerary, flight_number_provider):
    editor_client.get(search_url(itinerary))
    editor_client.get(search_url(itinerary, flightCode="kl 1000"))

    assert len(flight_number_provider.lookups) == 1


def test_search_for_a_flight_that_does_not_fly_is_empty(
    editor_client, itinerary, flight_number_provider
):
    flight_number_provider.journeys = []

    response = editor_client.get(search_url(itinerary))

    assert response.status_code == 200
    assert response.get_json()["data"] == []


def test_search_viewer_forbidden(viewer_client, itinerary):
    assert viewer_client.get(search_url(itinerary)).status_code == 403


def test_search_non_member(non_member_client, itinerary):
    assert non_member_client.get(search_url(itinerary)).status_code == 401


@pytest.mark.parametrize(
    "params",
    [
        {"flightCode": "117"},
        {"flightCode": "BA"},
        {"flightCode": "BA117XY"},
        {"flightCode": "B-117"},
        {"departureDate": "invalid"},
        {"departureDate": "2020-01-01"},
    ],
)
def test_search_validation(editor_client, itinerary, params):
    assert editor_client.get(search_url(itinerary, **params)).status_code == 400


def test_search_requires_both_fields(editor_client, itinerary):
    assert editor_client.get(url(itinerary)).status_code == 400


def test_search_is_unavailable_when_the_provider_fails(
    editor_client, itinerary, flight_number_provider
):
    flight_number_provider.error = "down"
    assert editor_client.get(search_url(itinerary)).status_code == 503


def test_search_is_unavailable_without_a_configured_provider(
    editor_client, itinerary, flight_number_provider
):
    flight_number_provider.configured = False
    assert editor_client.get(search_url(itinerary)).status_code == 503


def test_save_stores_every_leg(admin_client, itinerary):
    response = admin_client.post(url(itinerary), json=payload())

    assert response.status_code == 201
    data = response.get_json()["data"]
    assert len(data) == 2
    first, second = saved_flights(itinerary)
    assert (first.airline, first.flight_number) == ("KL", "1000")
    assert (first.departure_airport.code, first.arrival_airport.code) == ("LHR", "AMS")
    assert (second.departure_airport.code, second.arrival_airport.code) == (
        "AMS",
        "JFK",
    )


def test_save_puts_the_notes_on_the_first_leg_only(admin_client, itinerary):
    admin_client.post(url(itinerary), json=payload())

    first, second = saved_flights(itinerary)
    assert first.notes == "Window"
    assert second.notes is None


def test_save_adds_no_expense_because_there_is_no_price(admin_client, itinerary):
    admin_client.post(url(itinerary), json=payload())

    assert db.session.query(Expense).filter_by(itinerary_id=itinerary.id).count() == 0


def test_saving_again_adds_no_flights(admin_client, itinerary):
    admin_client.post(url(itinerary), json=payload())
    admin_client.post(url(itinerary), json=payload(notes="Aisle"))

    assert len(saved_flights(itinerary)) == 2


def test_save_for_a_flight_that_does_not_fly_is_not_found(
    admin_client, itinerary, flight_number_provider
):
    flight_number_provider.journeys = []

    response = admin_client.post(url(itinerary), json=payload())

    assert response.status_code == 404
    assert saved_flights(itinerary) == []


def test_save_viewer_forbidden(viewer_client, itinerary):
    assert viewer_client.post(url(itinerary), json=payload()).status_code == 403
    assert saved_flights(itinerary) == []


def test_save_validation(admin_client, itinerary):
    response = admin_client.post(url(itinerary), json=payload(flightCode="nope"))

    assert response.status_code == 400
    assert saved_flights(itinerary) == []


def test_provider_failure_saves_nothing(
    admin_client, itinerary, flight_number_provider
):
    flight_number_provider.error = "down"

    response = admin_client.post(url(itinerary), json=payload())

    assert response.status_code == 503
    assert saved_flights(itinerary) == []

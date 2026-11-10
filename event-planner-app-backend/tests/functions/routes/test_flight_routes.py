from dataclasses import replace
from datetime import date, timedelta

import pytest
from src.extensions import db
from src.models import Airport, Expense, Flight
from src.services import expense_service, flight_service

from tests.factories import FlightFactory, ItineraryFactory
from tests.fakes import BA117, FakeFlightProvider

DEPARTURE_DATE = (date.today() + timedelta(days=30)).isoformat()


def url(itinerary, suffix=""):
    return f"/api/itineraries/{itinerary.id}/flights{suffix}"


def payload(**overrides):
    data = {
        "origin": ["LHR", "LGW"],
        "destination": ["JFK"],
        "departureDate": DEPARTURE_DATE,
        "airline": "BA",
        "flightNumber": "117",
        "notes": "Window",
    }
    data.update(overrides)
    return data


@pytest.fixture(autouse=True)
def use_fake_provider(flight_provider):
    return flight_provider


def test_list_flights_viewer(viewer_client, itinerary, flight):
    response = viewer_client.get(url(itinerary))
    assert response.status_code == 200
    assert response.get_json()["data"][0]["departAt"] == "2026-08-01T08:00:00Z"


def test_flight_without_details_serialises_empty_lists(viewer_client, itinerary, flight):
    data = viewer_client.get(url(itinerary, f"/{flight.id}")).get_json()["data"]
    assert data["luggage"] == []
    assert data["extras"] == []
    assert "priceGbp" not in data
    assert data["purchaseUrl"] is None
    assert data["departureCity"] == "London"


def test_get_flight_viewer(viewer_client, itinerary, flight):
    response = viewer_client.get(url(itinerary, f"/{flight.id}"))
    assert response.status_code == 200
    assert response.get_json()["data"]["flightNumber"] == flight.flight_number


def test_list_flights_unauthenticated(client, itinerary):
    assert client.get(url(itinerary)).status_code == 401


def test_list_flights_non_member(non_member_client, itinerary):
    assert non_member_client.get(url(itinerary)).status_code == 401


def test_create_flight_admin(admin_client, itinerary):
    response = admin_client.post(url(itinerary), json=payload())
    assert response.status_code == 201
    data = response.get_json()["data"]
    assert data["departAt"] == "2026-08-01T10:00:00Z"
    assert data["departureAirport"] == "LHR"
    assert data["arrivalAirport"] == "JFK"
    assert data["departureTimezone"] == "Europe/London"
    assert data["arrivalTimezone"] == "America/New_York"
    assert data["departureAirportName"] == "London Heathrow Airport"
    assert data["departureCity"] == "London"
    assert data["arrivalCity"] == "New York"
    assert data["travelClass"] == "Economy"
    assert data["luggage"] == ["1 cabin bag included"]
    assert data["extras"] == [
        "Average legroom (31 in)",
        "Carbon emissions estimate: 292 kg",
    ]
    assert data["purchaseUrl"] == "https://www.google.com/travel/flights?q=lhr-jfk"
    assert "priceGbp" not in data
    assert data["airlineLogo"] == "https://logo/ba.png"
    assert db.session.query(Flight).filter_by(itinerary_id=itinerary.id).count() == 1


def test_create_flight_creates_missing_airports_once(admin_client, itinerary):
    admin_client.post(url(itinerary), json=payload())
    codes = db.session.query(Airport.code).filter(Airport.code.in_(["LHR", "JFK"]))
    assert sorted(code for (code,) in codes) == ["JFK", "LHR"]
    airport_count = db.session.query(Airport).count()

    admin_client.post(url(itinerary), json=payload(notes="Aisle"))
    assert db.session.query(Airport).count() == airport_count
    assert db.session.query(Flight).filter_by(itinerary_id=itinerary.id).count() == 1


def test_create_flight_unknown_offer(admin_client, itinerary):
    response = admin_client.post(url(itinerary), json=payload(flightNumber="999"))
    assert response.status_code == 404
    assert db.session.query(Flight).filter_by(itinerary_id=itinerary.id).count() == 0


def test_create_flight_reuses_cached_search(admin_client, itinerary, flight_provider):
    admin_client.get(
        url(itinerary, f"/search?origin=LGW,LHR&destination=JFK&departureDate={DEPARTURE_DATE}")
    )
    admin_client.post(url(itinerary), json=payload())
    assert len(flight_provider.searches) == 1


def test_create_flight_editor_sets_audit(editor_client, editor_user, itinerary):
    response = editor_client.post(url(itinerary), json=payload())
    assert response.status_code == 201
    flight = db.session.get(Flight, response.get_json()["data"]["id"])
    assert flight.created_by_id == editor_user.id
    assert flight.updated_by_id == editor_user.id


def test_create_flight_viewer_forbidden(viewer_client, itinerary):
    response = viewer_client.post(url(itinerary), json=payload())
    assert response.status_code == 403
    assert (
        db.session.query(Flight).filter_by(itinerary_id=itinerary.id).count() == 0
    )


def test_create_flight_non_member(non_member_client, itinerary):
    response = non_member_client.post(url(itinerary), json=payload())
    assert response.status_code == 401


@pytest.mark.parametrize(
    "overrides",
    [
        {"airline": "British Airways"},
        {"flightNumber": "!!"},
        {"departureDate": "invalid"},
        {"departureDate": "2020-01-01"},
        {"origin": ["LONDON"]},
        {"destination": []},
    ],
)
def test_create_flight_validation(admin_client, itinerary, overrides):
    response = admin_client.post(url(itinerary), json=payload(**overrides))
    assert response.status_code == 400


def test_create_flight_missing_required(admin_client, itinerary):
    response = admin_client.post(url(itinerary), json={"airline": "BA"})
    assert response.status_code == 400


def search_url(itinerary, **params):
    params = {
        "origin": "LHR,LGW",
        "destination": "JFK",
        "departureDate": DEPARTURE_DATE,
        **params,
    }
    query = "&".join(f"{key}={value}" for key, value in params.items())
    return url(itinerary, f"/search?{query}")


def test_search_flights_editor(editor_client, itinerary, flight_provider):
    response = editor_client.get(search_url(itinerary))
    assert response.status_code == 200
    [offer] = response.get_json()["data"]
    assert offer["airline"] == "BA"
    assert offer["flightNumber"] == "117"
    assert offer["departAt"] == "2026-08-01T10:00:00Z"
    assert offer["durationMinutes"] == 480
    assert offer["departureTimezone"] == "Europe/London"
    assert offer["arrivalTimezone"] == "America/New_York"
    assert offer["departureAirportName"] == "London Heathrow Airport"
    assert offer["arrivalCity"] == "New York"
    assert offer["priceGbp"] == 520
    assert offer["travelClass"] == "Economy"
    assert offer["luggage"] == ["1 cabin bag included"]
    assert offer["purchaseUrl"].startswith("https://www.google.com/travel/flights")
    assert flight_provider.searches == [(["LGW", "LHR"], ["JFK"], date.fromisoformat(DEPARTURE_DATE))]


def test_search_flights_is_cached(editor_client, itinerary, flight_provider):
    editor_client.get(search_url(itinerary))
    editor_client.get(search_url(itinerary, origin="LGW,LHR"))
    assert len(flight_provider.searches) == 1


def test_search_flights_provider_failure_falls_through(editor_client, itinerary, monkeypatch):
    from src.services.flight_providers import FlightProviderFactory

    failing = FakeFlightProvider(error="down")
    working = FakeFlightProvider()
    monkeypatch.setattr(
        FlightProviderFactory, "PROVIDERS", [lambda: failing, lambda: working]
    )

    response = editor_client.get(search_url(itinerary))
    assert response.status_code == 200
    assert len(failing.searches) == 1
    assert len(working.searches) == 1


def test_search_flights_all_providers_fail(editor_client, itinerary, flight_provider):
    flight_provider.error = "down"
    response = editor_client.get(search_url(itinerary))
    assert response.status_code == 503


def test_search_flights_no_configured_provider(editor_client, itinerary, flight_provider):
    flight_provider.configured = False
    assert editor_client.get(search_url(itinerary)).status_code == 503


def test_search_flights_viewer_forbidden(viewer_client, itinerary):
    assert viewer_client.get(search_url(itinerary)).status_code == 403


def test_search_flights_validation(editor_client, itinerary):
    assert editor_client.get(search_url(itinerary, origin="LONDON")).status_code == 400
    assert editor_client.get(url(itinerary, "/search")).status_code == 400


def test_search_airports_viewer(viewer_client, itinerary):
    response = viewer_client.get(url(itinerary, "/airports?q=paris&lat=48.85&lng=2.35"))
    assert response.status_code == 200
    first = response.get_json()["data"][0]
    assert first["label"] == "Paris, FR"
    assert {airport["code"] for airport in first["airports"]} >= {"CDG", "ORY"}


def test_search_airports_requires_query(viewer_client, itinerary):
    assert viewer_client.get(url(itinerary, "/airports")).status_code == 400


def test_update_flight_editor(editor_client, itinerary, flight):
    response = editor_client.patch(
        url(itinerary, f"/{flight.id}"), json={"notes": "Changed plans"}
    )
    assert response.status_code == 200
    assert response.get_json()["data"]["notes"] == "Changed plans"


def test_update_flight_viewer_forbidden(viewer_client, itinerary, flight):
    response = viewer_client.patch(
        url(itinerary, f"/{flight.id}"), json={"notes": "Changed plans"}
    )
    assert response.status_code == 403


def test_update_flight_not_found(admin_client, itinerary):
    assert (
        admin_client.patch(url(itinerary, "/9999"), json={"notes": "Changed plans"}).status_code
        == 404
    )


def test_update_flight_from_other_itinerary_not_found(admin_client, itinerary, admin_user):
    other = ItineraryFactory(creator=admin_user)
    other_flight = FlightFactory(itinerary=other, creator=admin_user)
    response = admin_client.patch(
        url(itinerary, f"/{other_flight.id}"), json={"notes": "Changed plans"}
    )
    assert response.status_code == 404


def test_delete_flight_admin(admin_client, itinerary, flight):
    flight_id = flight.id

    response = admin_client.delete(url(itinerary, f"/{flight_id}"))

    assert response.status_code == 200
    assert response.get_json()["data"] == {"deletedId": flight_id}
    assert db.session.get(Flight, flight_id) is None


def test_delete_flight_viewer_forbidden(viewer_client, itinerary, flight):
    assert viewer_client.delete(url(itinerary, f"/{flight.id}")).status_code == 403
    assert db.session.get(Flight, flight.id) is not None


def test_anonymous_access_code(client, admin_user):
    itinerary = ItineraryFactory(
        creator=admin_user, is_anonymous=True, anonymous_access_code="secret-code"
    )
    headers = {"X-Itinerary-Access-Code": "secret-code"}

    response = client.post(url(itinerary), json=payload(), headers=headers)
    assert response.status_code == 201
    assert response.get_json()["data"]["createdById"] is None

    assert client.get(url(itinerary), headers=headers).status_code == 200
    bad = client.get(url(itinerary), headers={"X-Itinerary-Access-Code": "nope"})
    assert bad.status_code == 401


def flight_expenses(itinerary):
    return db.session.query(Expense).filter_by(itinerary_id=itinerary.id).all()


def test_create_flight_also_creates_its_expense(admin_client, itinerary, admin_user):
    response = admin_client.post(url(itinerary), json=payload())

    flight_id = response.get_json()["data"]["id"]
    [expense] = flight_expenses(itinerary)
    assert expense.flight_id == flight_id
    assert expense.description == "BA117 · LHR → JFK"
    assert expense.category == "transport"
    assert expense.amount == expense.amount_gbp == 520
    assert expense.currency == "GBP"
    assert expense.paid_by_id == expense.created_by_id == admin_user.id
    assert expense.split_type == "even_all"
    assert str(expense.spent_on) == "2026-08-01"
    assert sum(share.amount_gbp for share in expense.shares) == 520


def test_expense_date_is_the_departure_airports_local_date(
    admin_client, itinerary, flight_provider
):
    late = replace(BA117, depart_at=BA117.depart_at.replace(day=1, hour=23))
    flight_provider.offers = [late]

    admin_client.post(url(itinerary), json=payload())

    assert str(flight_expenses(itinerary)[0].spent_on) == "2026-08-02"


def test_flight_without_a_price_gets_no_expense(admin_client, itinerary, flight_provider):
    flight_provider.offers = [replace(BA117, price_gbp=None)]

    response = admin_client.post(url(itinerary), json=payload())

    assert response.status_code == 201
    assert flight_expenses(itinerary) == []


def test_saving_the_same_flight_again_adds_no_expense(admin_client, itinerary):
    admin_client.post(url(itinerary), json=payload())
    admin_client.post(url(itinerary), json=payload(notes="Aisle"))

    assert len(flight_expenses(itinerary)) == 1


def test_a_deleted_flight_expense_is_not_recreated_on_resave(admin_client, itinerary):
    admin_client.post(url(itinerary), json=payload())
    expense_url = f"/api/itineraries/{itinerary.id}/expenses/{flight_expenses(itinerary)[0].id}"
    assert admin_client.delete(expense_url).status_code == 200

    admin_client.post(url(itinerary), json=payload(notes="Aisle"))

    assert flight_expenses(itinerary) == []


def test_deleting_the_expense_keeps_the_flight(admin_client, itinerary):
    flight_id = admin_client.post(url(itinerary), json=payload()).get_json()["data"]["id"]
    expense_id = flight_expenses(itinerary)[0].id

    admin_client.delete(f"/api/itineraries/{itinerary.id}/expenses/{expense_id}")

    assert db.session.get(Flight, flight_id) is not None


def test_deleting_the_flight_keeps_its_expense_unlinked(admin_client, itinerary):
    flight_id = admin_client.post(url(itinerary), json=payload()).get_json()["data"]["id"]

    assert admin_client.delete(url(itinerary, f"/{flight_id}")).status_code == 200

    [expense] = flight_expenses(itinerary)
    assert expense.flight_id is None


def test_flight_and_expense_are_saved_in_one_transaction(
    admin_client, itinerary, monkeypatch
):
    def fail(*args, **kwargs):
        raise RuntimeError("boom")

    monkeypatch.setattr(expense_service, "stage_create_expense", fail)

    with pytest.raises(RuntimeError):
        admin_client.post(url(itinerary), json=payload())

    assert db.session.query(Flight).filter_by(itinerary_id=itinerary.id).count() == 0
    assert flight_expenses(itinerary) == []


def test_no_expense_without_a_signed_in_user(flight):
    assert (
        flight_service.stage_flight_expense(
            None, flight, 520, flight.departure_airport, flight.arrival_airport
        )
        is None
    )

from datetime import date, timedelta

import pytest
from src.extensions import db
from src.models import Airport, Flight

from tests.factories import FlightFactory, ItineraryFactory
from tests.fakes import FakeFlightProvider

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
    assert db.session.query(Flight).filter_by(itinerary_id=itinerary.id).count() == 1


def test_create_flight_creates_missing_airports_once(admin_client, itinerary):
    admin_client.post(url(itinerary), json=payload())
    assert db.session.query(Airport).count() == 2

    admin_client.post(url(itinerary), json=payload(notes="Aisle"))
    assert db.session.query(Airport).count() == 2
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
    response = admin_client.delete(url(itinerary, f"/{flight.id}"))
    assert response.status_code == 200
    assert db.session.get(Flight, flight.id) is None


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

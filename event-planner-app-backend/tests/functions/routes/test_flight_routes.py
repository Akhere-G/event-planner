import pytest
from src.extensions import db
from src.models import Flight

from tests.factories import FlightFactory, ItineraryFactory


def url(itinerary, suffix=""):
    return f"/api/itineraries/{itinerary.id}/flights{suffix}"


def payload(**overrides):
    data = {
        "airline": "British Airways",
        "flightNumber": "BA117",
        "departureAirport": "LHR",
        "arrivalAirport": "JFK",
        "departureTimezone": "Europe/London",
        "arrivalTimezone": "America/New_York",
        "departAt": "2026-08-01T10:00:00Z",
        "arriveAt": "2026-08-01T18:00:00Z",
        "bookingRef": "ABC123",
        "seat": "12A",
        "notes": "Window",
        "travellers": [],
    }
    data.update(overrides)
    return data


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
    assert data["status"] is None
    assert db.session.query(Flight).filter_by(itinerary_id=itinerary.id).count() == 1


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


def test_create_flight_with_members_as_travellers(
    admin_client, admin_user, viewer_user, viewer_itinerary_user, itinerary
):
    response = admin_client.post(
        url(itinerary), json=payload(travellers=[admin_user.id, viewer_user.id])
    )
    assert response.status_code == 201
    assert response.get_json()["data"]["travellers"] == [admin_user.id, viewer_user.id]


def test_create_flight_traveller_not_member(admin_client, non_member_user, itinerary):
    response = admin_client.post(
        url(itinerary), json=payload(travellers=[non_member_user.id])
    )
    assert response.status_code == 400


@pytest.mark.parametrize(
    "overrides",
    [
        {"arriveAt": "2026-08-01T10:00:00Z"},
        {"arriveAt": "2026-08-01T09:00:00Z"},
        {"departAt": "2026-08-01T10:00:00"},
        {"departureAirport": "lhr"},
        {"arrivalAirport": "JFKK"},
        {"arrivalAirport": "LHR"},
        {"departureTimezone": "Mars/Olympus"},
        {"flightNumber": "!!"},
    ],
)
def test_create_flight_validation(admin_client, itinerary, overrides):
    response = admin_client.post(url(itinerary), json=payload(**overrides))
    assert response.status_code == 400


def test_create_flight_missing_required(admin_client, itinerary):
    response = admin_client.post(url(itinerary), json={"airline": "BA"})
    assert response.status_code == 400


def test_update_flight_editor(editor_client, itinerary, flight):
    response = editor_client.patch(url(itinerary, f"/{flight.id}"), json={"seat": "1A"})
    assert response.status_code == 200
    assert response.get_json()["data"]["seat"] == "1A"


def test_update_flight_arrival_before_existing_departure(
    admin_client, itinerary, flight
):
    response = admin_client.patch(
        url(itinerary, f"/{flight.id}"), json={"arriveAt": "2026-08-01T07:00:00Z"}
    )
    assert response.status_code == 400


def test_update_flight_viewer_forbidden(viewer_client, itinerary, flight):
    response = viewer_client.patch(
        url(itinerary, f"/{flight.id}"), json={"seat": "1A"}
    )
    assert response.status_code == 403


def test_update_flight_not_found(admin_client, itinerary):
    assert admin_client.patch(url(itinerary, "/9999"), json={"seat": "1"}).status_code == 404


def test_update_flight_from_other_itinerary_not_found(admin_client, itinerary, admin_user):
    other = ItineraryFactory(creator=admin_user)
    other_flight = FlightFactory(itinerary=other, creator=admin_user)
    response = admin_client.patch(
        url(itinerary, f"/{other_flight.id}"), json={"seat": "1"}
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

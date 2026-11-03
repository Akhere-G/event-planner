import pytest
from src.extensions import db
from src.models import Itinerary, TripPreferences
from tests.factories import ItineraryFactory

BODY = {
    "tripType": "friends",
    "groupSize": 4,
    "vibes": ["foodie", "nightlife"],
    "budgetTier": "mid",
    "pace": "packed",
    "interests": ["museums"],
    "transport": "walking",
}


def url(itinerary_id):
    return f"/api/itineraries/{itinerary_id}/preferences"


def test_get_returns_null_when_unset(viewer_client, itinerary):
    response = viewer_client.get(url(itinerary.id))
    assert response.status_code == 200
    assert response.get_json().get("data") is None


@pytest.mark.parametrize("client_name", ["admin_client", "editor_client"])
def test_put_creates_then_updates(request, client_name, itinerary):
    client = request.getfixturevalue(client_name)

    created = client.put(url(itinerary.id), json=BODY)
    assert created.status_code == 200
    assert created.get_json()["data"]["tripType"] == "friends"

    updated = client.put(url(itinerary.id), json={"groupSize": 6})
    assert updated.get_json()["data"]["groupSize"] == 6
    assert updated.get_json()["data"]["vibes"] == ["foodie", "nightlife"]
    assert db.session.query(TripPreferences).filter_by(itinerary_id=itinerary.id).count() == 1

    fetched = client.get(url(itinerary.id)).get_json()["data"]
    assert fetched["budgetTier"] == "mid"


def test_viewer_cannot_put(viewer_client, itinerary):
    assert viewer_client.put(url(itinerary.id), json=BODY).status_code == 403


def test_non_member_forbidden(non_member_client, itinerary):
    assert non_member_client.get(url(itinerary.id)).status_code in (401, 403)


@pytest.mark.parametrize(
    "body",
    [{"tripType": "alone"}, {"groupSize": 0}, {"budgetTier": "free"}, {"vibes": "x"}],
)
def test_put_rejects_invalid(editor_client, itinerary, body):
    assert editor_client.put(url(itinerary.id), json=body).status_code == 400


def test_trip_patch_does_not_accept_preferences(admin_client, itinerary):
    admin_client.patch(
        f"/api/itineraries/{itinerary.id}", json={"tripType": "solo", "groupSize": 9}
    )
    assert db.session.query(TripPreferences).filter_by(itinerary_id=itinerary.id).count() == 0
    assert db.session.get(Itinerary, itinerary.id).preferences is None


def test_put_ignores_non_editable_fields(editor_client, editor_user, itinerary):
    other = ItineraryFactory()
    response = editor_client.put(
        url(itinerary.id),
        json={
            "groupSize": 3,
            "id": 9999,
            "itineraryId": other.id,
            "createdById": 12345,
            "updatedById": 12345,
            "createdAt": "2000-01-01T00:00:00",
        },
    )

    assert response.status_code == 200
    saved = (
        db.session.query(TripPreferences).filter_by(itinerary_id=itinerary.id).one()
    )
    assert saved.group_size == 3
    assert saved.id != 9999
    assert saved.itinerary_id == itinerary.id
    assert saved.created_by_id == editor_user.id
    assert saved.updated_by_id == editor_user.id
    assert saved.created_at.year != 2000
    assert (
        db.session.query(TripPreferences).filter_by(itinerary_id=other.id).count()
        == 0
    )

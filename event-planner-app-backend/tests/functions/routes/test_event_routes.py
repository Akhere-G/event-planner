from datetime import datetime
from sqlalchemy import select, func
from src.models import Event
from src.extensions import db


def test_get_events_success(admin_client, itinerary, event):
    response = admin_client.get(f"/api/itineraries/{itinerary.id}/events")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "events" in data["data"]
    assert len(data["data"]["events"]) == 1
    assert data["data"]["events"][0]["id"] == event.id
    assert data["data"]["events"][0]["name"] == event.name


def test_get_events_unauthenticated_unauthorised(client, itinerary):
    response = client.get(f"/api/itineraries/{itinerary.id}/events")
    assert response.status_code == 401


def test_get_events_non_member_unauthorised(non_member_client, itinerary):
    response = non_member_client.get(f"/api/itineraries/{itinerary.id}/events")
    assert response.status_code == 401


def test_create_event_admin_success(admin_client, itinerary):
    initial_count = db.session.execute(
        select(func.count()).where(Event.itinerary_id == itinerary.id)
    ).scalar()

    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/events",
        json={
            "name": "New Event",
            "address": "123 Test St",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": "2026-08-20T10:00:00Z",
            "end_at": "2026-08-20T12:00:00Z",
            "category": "food",
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True

    final_count = db.session.execute(
        select(func.count()).where(Event.itinerary_id == itinerary.id)
    ).scalar()
    assert final_count == initial_count + 1

    new_event = db.session.execute(
        select(Event).where(Event.name == "New Event")
    ).scalar_one_or_none()
    assert new_event is not None
    assert new_event.address == "123 Test St"
    assert new_event.latitude == 40.7128
    assert new_event.longitude == -74.0060


def test_create_event_editor_success(editor_client, itinerary):
    initial_count = db.session.execute(
        select(func.count()).where(Event.itinerary_id == itinerary.id)
    ).scalar()

    response = editor_client.post(
        f"/api/itineraries/{itinerary.id}/events",
        json={
            "name": "New Event",
            "address": "123 Test St",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": "2026-08-20T10:00:00Z",
            "end_at": "2026-08-20T12:00:00Z",
            "category": "food",
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True

    final_count = db.session.execute(
        select(func.count()).where(Event.itinerary_id == itinerary.id)
    ).scalar()
    assert initial_count == 0

    assert final_count == initial_count + 1

    new_event = db.session.execute(
        select(Event).where(
            Event.name == "New Event",
            Event.itinerary_id == itinerary.id,
        )
    ).scalar_one_or_none()
    assert new_event is not None
    assert new_event.address == "123 Test St"
    assert new_event.latitude == 40.7128
    assert new_event.longitude == -74.0060


def test_create_event_viewer_unauthorised(viewer_client, itinerary):
    response = viewer_client.post(
        f"/api/itineraries/{itinerary.id}/events",
        json={
            "name": "New Event",
            "address": "123 Test St",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": "2026-08-20T10:00:00Z",
            "end_at": "2026-08-20T12:00:00Z",
            "category": "food",
        },
    )
    assert response.status_code == 403


def test_create_event_unauthenticated_unauthorised(client, itinerary):
    response = client.post(
        f"/api/itineraries/{itinerary.id}/events",
        json={
            "name": "New Event",
            "address": "123 Test St",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": "2026-08-20T10:00:00Z",
            "end_at": "2026-08-20T12:00:00Z",
            "category": "food",
        },
    )
    assert response.status_code == 401


def test_create_event_non_member_unauthorised(non_member_client, itinerary):
    response = non_member_client.post(
        f"/api/itineraries/{itinerary.id}/events",
        json={
            "name": "New Event",
            "address": "123 Test St",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_at": "2026-08-20T10:00:00Z",
            "end_at": "2026-08-20T12:00:00Z",
            "category": "food",
        },
    )
    assert response.status_code == 401


def test_update_event_admin_success(admin_client, itinerary, event):
    response = admin_client.patch(
        f"/api/itineraries/{itinerary.id}/events/{event.id}",
        json={"name": "Updated Event"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    updated_event = db.session.execute(
        select(Event).where(Event.id == event.id)
    ).scalar_one_or_none()
    assert updated_event is not None
    assert updated_event.name == "Updated Event"


def test_update_event_editor_success(editor_client, itinerary, event):
    response = editor_client.patch(
        f"/api/itineraries/{itinerary.id}/events/{event.id}",
        json={"name": "Updated Event"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    updated_event = db.session.execute(
        select(Event).where(Event.id == event.id)
    ).scalar_one_or_none()
    assert updated_event is not None
    assert updated_event.name == "Updated Event"


def test_update_event_viewer_unauthorised(viewer_client, itinerary, event):
    response = viewer_client.patch(
        f"/api/itineraries/{itinerary.id}/events/{event.id}",
        json={"name": "Updated Event"},
    )
    assert response.status_code == 403


def test_update_event_unauthenticated_unauthorised(client, itinerary, event):
    response = client.patch(
        f"/api/itineraries/{itinerary.id}/events/{event.id}",
        json={"name": "Updated Event"},
    )
    assert response.status_code == 401


def test_update_event_non_member_unauthorised(non_member_client, itinerary, event):
    response = non_member_client.patch(
        f"/api/itineraries/{itinerary.id}/events/{event.id}",
        json={"name": "Updated Event"},
    )
    assert response.status_code == 401


def test_delete_event_admin_success(admin_client, itinerary, event):
    response = admin_client.delete(f"/api/itineraries/{itinerary.id}/events/{event.id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    deleted_event = db.session.execute(
        select(Event).where(Event.id == event.id)
    ).scalar_one_or_none()
    assert deleted_event is None


def test_delete_event_editor_success(editor_client, itinerary, event):
    response = editor_client.delete(
        f"/api/itineraries/{itinerary.id}/events/{event.id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    deleted_event = db.session.execute(
        select(Event).where(Event.id == event.id)
    ).scalar_one_or_none()
    assert deleted_event is None


def test_delete_event_viewer_unauthorised(viewer_client, itinerary, event):
    response = viewer_client.delete(
        f"/api/itineraries/{itinerary.id}/events/{event.id}"
    )
    assert response.status_code == 403


def test_delete_event_unauthenticated_unauthorised(client, itinerary, event):
    response = client.delete(f"/api/itineraries/{itinerary.id}/events/{event.id}")
    assert response.status_code == 401


def test_delete_event_non_member_forbidden(non_member_client, itinerary, event):
    response = non_member_client.delete(
        f"/api/itineraries/{itinerary.id}/events/{event.id}"
    )
    assert response.status_code == 401

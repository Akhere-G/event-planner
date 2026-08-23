from datetime import date

from sqlalchemy import func, select
from src.extensions import db
from src.models import Itinerary, ItineraryUser, UserRole


def test_get_itineraries_success(admin_client, admin_user, itinerary):
    response = admin_client.get("/api/itineraries")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "itineraries" in data["data"]

    user_memberships = (
        db.session.execute(
            select(ItineraryUser).where(ItineraryUser.user_id == admin_user.id)
        )
        .scalars()
        .all()
    )
    assert len(data["data"]["itineraries"]) == len(user_memberships)
    retrieved_ids = [it["id"] for it in data["data"]["itineraries"]]
    assert itinerary.id in retrieved_ids


def test_get_itineraries_with_pagination(admin_client, admin_user, itinerary):
    response = admin_client.get("/api/itineraries?limit=10&offset=0")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "itineraries" in data["data"]

    user_memberships = (
        db.session.execute(
            select(ItineraryUser).where(ItineraryUser.user_id == admin_user.id)
        )
        .scalars()
        .all()
    )
    assert len(data["data"]["itineraries"]) == len(user_memberships)


def test_get_itineraries_unauthenticated_unauthorised(client):
    response = client.get("/api/itineraries")
    assert response.status_code == 401


def test_get_itinerary_success(admin_client, itinerary):
    response = admin_client.get(f"/api/itineraries/{itinerary.id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary is not None
    assert data["data"]["id"] == db_itinerary.id
    assert data["data"]["name"] == db_itinerary.name
    assert data["data"]["destination"] == db_itinerary.destination


def test_get_itinerary_unauthenticated_unauthorised(client, itinerary):
    response = client.get(f"/api/itineraries/{itinerary.id}")
    assert response.status_code == 401


def test_get_itinerary_not_member(non_member_client, itinerary):
    response = non_member_client.get(f"/api/itineraries/{itinerary.id}")
    assert response.status_code == 404


def test_create_itinerary_success(auth_client, admin_user):
    initial_count = db.session.execute(
        select(func.count()).where(ItineraryUser.user_id == admin_user.id)
    ).scalar()

    response = auth_client.post(
        "/api/itineraries",
        json={
            "name": "New Trip",
            "destination": "Tokyo",
            "latitude": 35.6762,
            "longitude": 139.6503,
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True

    final_count = db.session.execute(
        select(func.count()).where(ItineraryUser.user_id == admin_user.id)
    ).scalar()
    assert final_count == initial_count + 1

    created_itinerary_id = data["data"]["id"]
    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == created_itinerary_id)
    ).scalar_one_or_none()
    assert db_itinerary is not None
    assert db_itinerary.name == "New Trip"
    assert db_itinerary.destination == "Tokyo"

    membership = db.session.execute(
        select(ItineraryUser).where(
            ItineraryUser.itinerary_id == created_itinerary_id,
            ItineraryUser.user_id == admin_user.id,
        )
    ).scalar_one_or_none()
    assert membership is not None
    assert membership.role == UserRole.ADMIN.value


def test_create_itinerary_unauthenticated_unauthorised(client):
    response = client.post(
        "/api/itineraries",
        json={
            "name": "New Trip",
            "destination": "Tokyo",
            "latitude": 35.6762,
            "longitude": 139.6503,
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
        },
    )
    assert response.status_code == 401


def test_update_itinerary_admin_success(admin_client, itinerary):
    response = admin_client.patch(
        f"/api/itineraries/{itinerary.id}",
        json={"name": "Updated Trip"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    updated_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert updated_itinerary is not None
    assert updated_itinerary.name == "Updated Trip"


def test_update_itinerary_editor_forbidden(editor_client, itinerary):
    old_name = itinerary.name
    response = editor_client.patch(
        f"/api/itineraries/{itinerary.id}",
        json={"name": "Updated Trip"},
    )
    assert response.status_code == 403

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary.name == old_name


def test_update_itinerary_viewer_forbidden(viewer_client, itinerary):
    old_name = itinerary.name
    response = viewer_client.patch(
        f"/api/itineraries/{itinerary.id}",
        json={"name": "Updated Trip"},
    )
    assert response.status_code == 403

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary.name == old_name


def test_update_itinerary_unauthenticated_unauthorised(client, itinerary):
    old_name = itinerary.name
    response = client.patch(
        f"/api/itineraries/{itinerary.id}",
        json={"name": "Updated Trip"},
    )
    assert response.status_code == 401

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary.name == old_name


def test_update_itinerary_not_member(non_member_client, itinerary):
    old_name = itinerary.name
    response = non_member_client.patch(
        f"/api/itineraries/{itinerary.id}",
        json={"name": "Updated Trip"},
    )
    assert response.status_code == 404

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary.name == old_name


def test_delete_itinerary_admin_success(admin_client, itinerary):
    response = admin_client.delete(f"/api/itineraries/{itinerary.id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    deleted_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert deleted_itinerary is None


def test_delete_itinerary_editor_forbidden(editor_client, itinerary):
    response = editor_client.delete(f"/api/itineraries/{itinerary.id}")
    assert response.status_code == 403

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary is not None


def test_delete_itinerary_viewer_forbidden(viewer_client, itinerary):
    response = viewer_client.delete(f"/api/itineraries/{itinerary.id}")
    assert response.status_code == 403

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary is not None


def test_delete_itinerary_unauthenticated_unauthorised(client, itinerary):
    response = client.delete(f"/api/itineraries/{itinerary.id}")
    assert response.status_code == 401

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary is not None


def test_delete_itinerary_not_member(non_member_client, itinerary):
    response = non_member_client.delete(f"/api/itineraries/{itinerary.id}")
    assert response.status_code == 404

    db_itinerary = db.session.execute(
        select(Itinerary).where(Itinerary.id == itinerary.id)
    ).scalar_one_or_none()
    assert db_itinerary is not None

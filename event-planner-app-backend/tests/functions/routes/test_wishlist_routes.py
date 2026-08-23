from datetime import datetime


def test_get_wishlists_admin_success(admin_client, itinerary, wishlist):
    response = admin_client.get(f"/api/itineraries/{itinerary.id}/wishlists")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_get_wishlists_editor_success(editor_client, itinerary, wishlist):
    response = editor_client.get(f"/api/itineraries/{itinerary.id}/wishlists")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_get_wishlists_viewer_success(viewer_client, itinerary, wishlist):
    response = viewer_client.get(f"/api/itineraries/{itinerary.id}/wishlists")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_get_wishlists_user_not_in_itinerary(client, itinerary):
    response = client.get(f"/api/itineraries/{itinerary.id}/wishlists")
    assert response.status_code == 401


def test_create_wishlist_admin_success(admin_client, itinerary):
    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists",
        json={"name": "Restaurants"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True


def test_create_wishlist_editor_success(editor_client, itinerary):
    response = editor_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists",
        json={"name": "Restaurants"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True


def test_create_wishlist_viewer_forbidden(viewer_client, itinerary):
    response = viewer_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists",
        json={"name": "Restaurants"},
    )
    assert response.status_code == 403


def test_create_wishlist_user_not_in_itinerary(client, itinerary):
    response = client.post(
        f"/api/itineraries/{itinerary.id}/wishlists",
        json={"name": "Restaurants"},
    )
    assert response.status_code == 401


def test_create_wishlist_missing_name(admin_client, itinerary):
    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists",
        json={},
    )
    assert response.status_code == 400


def test_delete_wishlist_admin_success(admin_client, itinerary, wishlist):
    response = admin_client.delete(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_delete_wishlist_editor_success(editor_client, itinerary, wishlist):
    response = editor_client.delete(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_delete_wishlist_viewer_forbidden(viewer_client, itinerary, wishlist):
    response = viewer_client.delete(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}"
    )
    assert response.status_code == 403


def test_delete_wishlist_user_not_in_itinerary(client, itinerary, wishlist):
    response = client.delete(f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}")
    assert response.status_code == 401


def test_update_wishlist_admin_success(admin_client, itinerary, wishlist):
    response = admin_client.patch(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_update_wishlist_editor_success(editor_client, itinerary, wishlist):
    response = editor_client.patch(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_update_wishlist_viewer_forbidden(viewer_client, itinerary, wishlist):
    response = viewer_client.patch(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 403


def test_update_wishlist_user_not_in_itinerary(client, itinerary, wishlist):
    response = client.patch(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 401


def test_update_wishlist_missing_name(admin_client, itinerary, wishlist):
    response = admin_client.patch(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}",
        json={},
    )
    assert response.status_code == 400


def test_create_wishlist_item_admin_success(admin_client, itinerary, wishlist):
    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items",
        json={
            "name": "Great Restaurant",
            "address": "123 Food St",
            "latitude": 40.7128,
            "longitude": -74.0060,
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True


def test_create_wishlist_item_editor_success(editor_client, itinerary, wishlist):
    response = editor_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items",
        json={
            "name": "Great Restaurant",
            "address": "123 Food St",
            "latitude": 40.7128,
            "longitude": -74.0060,
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True


def test_create_wishlist_item_viewer_forbidden(viewer_client, itinerary, wishlist):
    response = viewer_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items",
        json={
            "name": "Great Restaurant",
            "address": "123 Food St",
            "latitude": 40.7128,
            "longitude": -74.0060,
        },
    )
    assert response.status_code == 403


def test_delete_wishlist_item_admin_success(
    admin_client, itinerary, wishlist, wishlist_item
):
    response = admin_client.delete(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_delete_wishlist_item_editor_success(
    editor_client, itinerary, wishlist, wishlist_item
):
    response = editor_client.delete(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_delete_wishlist_item_viewer_forbidden(
    viewer_client, itinerary, wishlist, wishlist_item
):
    response = viewer_client.delete(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}"
    )
    assert response.status_code == 403


def test_update_wishlist_item_admin_success(
    admin_client, itinerary, wishlist, wishlist_item
):
    response = admin_client.patch(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}",
        json={"name": "Updated Item"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_update_wishlist_item_editor_success(
    editor_client, itinerary, wishlist, wishlist_item
):
    response = editor_client.patch(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}",
        json={"name": "Updated Item"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_update_wishlist_item_viewer_forbidden(
    viewer_client, itinerary, wishlist, wishlist_item
):
    response = viewer_client.patch(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}",
        json={"name": "Updated Item"},
    )
    assert response.status_code == 403


def test_promote_wishlist_item_admin_success(
    admin_client, itinerary, wishlist, wishlist_item
):
    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}/promote",
        json={
            "startAt": "2026-08-20T10:00:00Z",
            "endAt": "2026-08-20T12:00:00Z",
        },
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_promote_wishlist_item_editor_success(
    editor_client, itinerary, wishlist, wishlist_item
):
    response = editor_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}/promote",
        json={
            "startAt": "2026-08-20T10:00:00Z",
            "endAt": "2026-08-20T12:00:00Z",
        },
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_promote_wishlist_item_viewer_forbidden(
    viewer_client, itinerary, wishlist, wishlist_item
):
    response = viewer_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}/promote",
        json={
            "startAt": "2026-08-20T10:00:00Z",
            "endAt": "2026-08-20T12:00:00Z",
        },
    )
    assert response.status_code == 403


def test_promote_wishlist_item_missing_dates(
    admin_client, itinerary, wishlist, wishlist_item
):
    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}/promote",
        json={},
    )
    assert response.status_code == 400


def test_vote_for_wishlist_item_admin_success(
    admin_client, itinerary, wishlist, wishlist_item
):
    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}/vote",
        json={"vote": 1},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_vote_for_wishlist_item_editor_success(
    editor_client, itinerary, wishlist, wishlist_item
):
    response = editor_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}/vote",
        json={"vote": 1},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_vote_for_wishlist_item_viewer_success(
    viewer_client, itinerary, wishlist, wishlist_item
):
    response = viewer_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}/vote",
        json={"vote": 1},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_vote_for_wishlist_item_missing_vote(
    admin_client, itinerary, wishlist, wishlist_item
):
    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/wishlists/{wishlist.id}/items/{wishlist_item.id}/vote",
        json={},
    )
    assert response.status_code == 400

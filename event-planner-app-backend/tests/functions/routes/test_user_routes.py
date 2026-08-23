def test_get_users_admin_success(admin_client, itinerary):
    response = admin_client.get(f"/api/itineraries/{itinerary.id}/users")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "users" in data["data"]


def test_get_users_user_not_in_itinerary(client, itinerary):
    response = client.get(f"/api/itineraries/{itinerary.id}/users")
    assert response.status_code == 401


def test_update_user_role_admin_success(
    admin_client, itinerary, editor_user, editor_itinerary_user
):
    response = admin_client.patch(
        f"/api/itineraries/{itinerary.id}/users/{editor_user.id}",
        json={"role": "viewer"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_update_user_role_editor_forbidden(
    editor_client, itinerary, viewer_user, viewer_itinerary_user
):
    response = editor_client.patch(
        f"/api/itineraries/{itinerary.id}/users/{viewer_user.id}",
        json={"role": "viewer"},
    )
    assert response.status_code == 403


def test_update_user_role_viewer_forbidden(
    viewer_client, itinerary, editor_user, editor_itinerary_user
):
    response = viewer_client.patch(
        f"/api/itineraries/{itinerary.id}/users/{editor_user.id}",
        json={"role": "viewer"},
    )
    assert response.status_code == 403


def test_update_user_role_invalid_role(
    admin_client, itinerary, editor_user, editor_itinerary_user
):
    response = admin_client.patch(
        f"/api/itineraries/{itinerary.id}/users/{editor_user.id}",
        json={"role": "invalid_role"},
    )
    assert response.status_code == 400


def test_update_user_role_user_not_in_itinerary(
    client, itinerary, editor_user, editor_itinerary_user
):
    response = client.patch(
        f"/api/itineraries/{itinerary.id}/users/{editor_user.id}",
        json={"role": "viewer"},
    )
    assert response.status_code == 401


def test_remove_user_self_success(
    viewer_client, itinerary, viewer_user, viewer_itinerary_user
):
    response = viewer_client.delete(
        f"/api/itineraries/{itinerary.id}/users/{viewer_user.id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_remove_user_admin_success(
    admin_client, itinerary, viewer_user, viewer_itinerary_user
):
    response = admin_client.delete(
        f"/api/itineraries/{itinerary.id}/users/{viewer_user.id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_remove_user_editor_forbidden(
    editor_client, itinerary, viewer_user, viewer_itinerary_user
):
    response = editor_client.delete(
        f"/api/itineraries/{itinerary.id}/users/{viewer_user.id}"
    )
    assert response.status_code == 403


def test_remove_user_viewer_forbidden(
    viewer_client, itinerary, editor_user, editor_itinerary_user
):
    response = viewer_client.delete(
        f"/api/itineraries/{itinerary.id}/users/{editor_user.id}"
    )
    assert response.status_code == 403


def test_remove_user_user_not_in_itinerary(
    client, itinerary, viewer_user, viewer_itinerary_user
):
    response = client.delete(f"/api/itineraries/{itinerary.id}/users/{viewer_user.id}")
    assert response.status_code == 401

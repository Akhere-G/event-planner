def test_get_user_invites_success(invited_user_client, invite):
    response = invited_user_client.get("/api/invites")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "invites" in data["data"]


def test_get_user_invites_empty(invited_user_client):
    response = invited_user_client.get("/api/invites")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_get_user_invite_success(invited_user_client, invite):
    response = invited_user_client.get(f"/api/invites/{invite.token}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_get_user_invite_not_found(invited_user_client):
    response = invited_user_client.get("/api/invites/invalid_token")
    assert response.status_code == 404


def test_accept_invite_success(invited_user_client, invite):
    response = invited_user_client.post(f"/api/invites/{invite.token}/accept")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_accept_invite_not_found(invited_user_client):
    response = invited_user_client.post("/api/invites/invalid_token/accept")
    assert response.status_code == 404


def test_decline_invite_success(invited_user_client, invite):
    response = invited_user_client.post(f"/api/invites/{invite.token}/decline")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_decline_invite_not_found(invited_user_client):
    response = invited_user_client.post("/api/invites/invalid_token/decline")
    assert response.status_code == 404


def test_join_itinerary_viewer_code(invited_user_client, itinerary):
    response = invited_user_client.post(f"/api/invites/join/{itinerary.viewer_code}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_join_itinerary_editor_code(invited_user_client, itinerary):
    response = invited_user_client.post(f"/api/invites/join/{itinerary.editor_code}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_join_itinerary_admin_code(invited_user_client, itinerary):
    response = invited_user_client.post(f"/api/invites/join/{itinerary.admin_code}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_join_itinerary_invalid_code(invited_user_client):
    response = invited_user_client.post("/api/invites/join/invalid_code")
    assert response.status_code == 404

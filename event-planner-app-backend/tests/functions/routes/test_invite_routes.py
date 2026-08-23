from sqlalchemy import func, select
from src.extensions import db
from src.models import InvitationStatus, Invite, UserRole


def test_get_invites_admin_success(admin_client, itinerary, invite):
    response = admin_client.get(f"/api/itineraries/{itinerary.id}/invites")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "invites" in data["data"]

    db_invites = (
        db.session.execute(select(Invite).where(Invite.itinerary_id == itinerary.id))
        .scalars()
        .all()
    )
    assert len(data["data"]["invites"]) == len(db_invites)
    assert data["data"]["invites"][0]["id"] == invite.id
    assert data["data"]["invites"][0]["email"] == invite.email


def test_get_invites_unauthenticated_unauthorised(client, itinerary):
    response = client.get(f"/api/itineraries/{itinerary.id}/invites")
    assert response.status_code == 401


def test_get_invites_user_not_in_itinerary(non_member_client, itinerary):
    response = non_member_client.get(f"/api/itineraries/{itinerary.id}/invites")
    assert response.status_code == 404


def test_create_invite_admin_success(admin_client, itinerary, invited_user):
    initial_count = db.session.execute(
        select(func.count()).where(Invite.itinerary_id == itinerary.id)
    ).scalar()

    response = admin_client.post(
        f"/api/itineraries/{itinerary.id}/invites",
        json={"email": "new_invitee@example.com", "role": "viewer"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True

    final_count = db.session.execute(
        select(func.count()).where(Invite.itinerary_id == itinerary.id)
    ).scalar()
    assert final_count == initial_count + 1

    created_invite = db.session.execute(
        select(Invite).where(
            Invite.itinerary_id == itinerary.id,
            Invite.email == "new_invitee@example.com",
        )
    ).scalar_one_or_none()
    assert created_invite is not None
    assert created_invite.role == UserRole.VIEWER.value


def test_create_invite_editor_forbidden(editor_client, itinerary, invited_user):
    initial_count = db.session.execute(
        select(func.count()).where(Invite.itinerary_id == itinerary.id)
    ).scalar()

    response = editor_client.post(
        f"/api/itineraries/{itinerary.id}/invites",
        json={"email": invited_user.email, "role": "viewer"},
    )
    assert response.status_code == 403

    final_count = db.session.execute(
        select(func.count()).where(Invite.itinerary_id == itinerary.id)
    ).scalar()
    assert final_count == initial_count


def test_create_invite_viewer_forbidden(viewer_client, itinerary, invited_user):
    initial_count = db.session.execute(
        select(func.count()).where(Invite.itinerary_id == itinerary.id)
    ).scalar()

    response = viewer_client.post(
        f"/api/itineraries/{itinerary.id}/invites",
        json={"email": invited_user.email, "role": "viewer"},
    )
    assert response.status_code == 403

    final_count = db.session.execute(
        select(func.count()).where(Invite.itinerary_id == itinerary.id)
    ).scalar()
    assert final_count == initial_count


def test_create_invite_unauthenticated_unauthorised(client, itinerary, invited_user):
    response = client.post(
        f"/api/itineraries/{itinerary.id}/invites",
        json={"email": invited_user.email, "role": "viewer"},
    )
    assert response.status_code == 401


def test_create_invite_user_not_in_itinerary(
    non_member_client, itinerary, invited_user
):
    response = non_member_client.post(
        f"/api/itineraries/{itinerary.id}/invites",
        json={"email": invited_user.email, "role": "viewer"},
    )
    assert response.status_code == 404


def test_revoke_invite_admin_success(admin_client, itinerary, invite):
    response = admin_client.delete(
        f"/api/itineraries/{itinerary.id}/invites/{invite.id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    updated_invite = db.session.execute(
        select(Invite).where(Invite.id == invite.id)
    ).scalar_one_or_none()
    assert updated_invite is not None
    assert updated_invite.status == InvitationStatus.REVOKED.value


def test_revoke_invite_editor_forbidden(editor_client, itinerary, invite):
    response = editor_client.delete(
        f"/api/itineraries/{itinerary.id}/invites/{invite.id}"
    )
    assert response.status_code == 403

    updated_invite = db.session.execute(
        select(Invite).where(Invite.id == invite.id)
    ).scalar_one_or_none()
    assert updated_invite is not None
    assert updated_invite.status != InvitationStatus.REVOKED.value


def test_revoke_invite_viewer_forbidden(viewer_client, itinerary, invite):
    response = viewer_client.delete(
        f"/api/itineraries/{itinerary.id}/invites/{invite.id}"
    )
    assert response.status_code == 403

    updated_invite = db.session.execute(
        select(Invite).where(Invite.id == invite.id)
    ).scalar_one_or_none()
    assert updated_invite is not None
    assert updated_invite.status != InvitationStatus.REVOKED.value


def test_revoke_invite_unauthenticated_unauthorised(client, itinerary, invite):
    response = client.delete(f"/api/itineraries/{itinerary.id}/invites/{invite.id}")
    assert response.status_code == 401


def test_revoke_invite_user_not_in_itinerary(non_member_client, itinerary, invite):
    response = non_member_client.delete(
        f"/api/itineraries/{itinerary.id}/invites/{invite.id}"
    )
    assert response.status_code == 404

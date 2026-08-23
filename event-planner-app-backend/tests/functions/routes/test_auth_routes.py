from sqlalchemy import select
from src.extensions import db
from src.models import User


def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "repeat_password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "userId" in data["data"]

    user = db.session.execute(
        select(User).where(User.id == data["data"]["userId"])
    ).scalar_one_or_none()

    assert user is not None
    assert user.email == "test@example.com"


def test_register_password_mismatch(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "repeat_password": "different",
        },
    )
    assert response.status_code == 400


def test_register_bad_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "short",
            "repeat_password": "short",
        },
    )
    assert response.status_code == 400


def test_register_existing_email(client, user):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser2",
            "email": user.email,
            "password": "password123",
            "repeat_password": "password123",
        },
    )
    assert response.status_code == 409


def test_login_success(client, user):
    response = client.post(
        "/api/auth/login",
        json={"email": user.email, "password": "password123"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "userId" in data["data"]

    result = db.session.execute(
        select(User).where(User.id == data["data"]["userId"])
    ).scalar_one_or_none()

    assert result is not None
    assert result.email == user.email


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrong"},
    )
    assert response.status_code == 401


def test_login_correct_email_wrong_password(client, user):
    response = client.post(
        "/api/auth/login",
        json={"email": user.email, "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_logout_success(auth_client):
    response = auth_client.post("/api/auth/logout")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    with auth_client.session_transaction() as session:
        assert session.get("user_id") is None


def test_check_auth_authenticated(auth_client):
    response = auth_client.get("/api/auth/check")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "userId" in data["data"]


def test_check_auth_not_authenticated(client):
    response = client.get("/api/auth/check")
    assert response.status_code == 401
    data = response.get_json()
    assert data["success"] is False

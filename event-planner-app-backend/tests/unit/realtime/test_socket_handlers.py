import pytest
from src.extensions import db, socketio
from src.realtime.presence import PresenceStore, reset_presence_store


@pytest.fixture(autouse=True)
def presence_store():
    store = PresenceStore(None)
    reset_presence_store(store)
    yield store
    reset_presence_store(None)


@pytest.fixture
def anonymous_itinerary(itinerary):
    itinerary.is_anonymous = True
    itinerary.anonymous_access_code = "secret-code"
    db.session.flush()
    return itinerary


def connect(app, client=None, auth=None):
    return socketio.test_client(app, flask_test_client=client, auth=auth)


def test_connection_refused_without_credentials(app, client):
    sock = connect(app, client)
    assert not sock.is_connected()


@pytest.mark.parametrize("client_fixture", ["admin_client", "editor_client", "viewer_client"])
def test_members_can_join_trip_room(request, app, itinerary, client_fixture):
    sock = connect(app, request.getfixturevalue(client_fixture))
    assert sock.is_connected()

    ack = sock.emit("trip:join", {"trip_id": itinerary.id}, callback=True)

    assert ack["ok"] is True


def test_non_member_cannot_join(app, itinerary, non_member_client):
    sock = connect(app, non_member_client)
    ack = sock.emit("trip:join", {"trip_id": itinerary.id}, callback=True)

    assert ack == {"ok": False, "error": "Not authorised"}
    sock.emit("noop")
    assert sock.get_received() == []


def test_unknown_trip_is_rejected(app, viewer_client):
    sock = connect(app, viewer_client)
    ack = sock.emit("trip:join", {"trip_id": 999999}, callback=True)

    assert ack["ok"] is False


def test_invalid_trip_payload_is_rejected(app, viewer_client):
    sock = connect(app, viewer_client)

    assert sock.emit("trip:join", {"trip_id": "1"}, callback=True)["ok"] is False
    assert sock.emit("trip:join", None, callback=True)["ok"] is False


def test_anonymous_code_grants_access(app, client, anonymous_itinerary):
    sock = connect(app, client, auth={"access_code": "secret-code"})
    ack = sock.emit("trip:join", {"trip_id": anonymous_itinerary.id}, callback=True)

    assert ack["ok"] is True


def test_wrong_anonymous_code_is_rejected(app, client, anonymous_itinerary):
    sock = connect(app, client, auth={"access_code": "nope"})
    ack = sock.emit("trip:join", {"trip_id": anonymous_itinerary.id}, callback=True)

    assert ack["ok"] is False


def test_anonymous_code_does_not_open_non_anonymous_trip(app, client, itinerary):
    itinerary.anonymous_access_code = "secret-code"
    db.session.flush()
    sock = connect(app, client, auth={"access_code": "secret-code"})
    ack = sock.emit("trip:join", {"trip_id": itinerary.id}, callback=True)

    assert ack["ok"] is False


def test_only_room_members_receive_trip_changed(
    app, admin_client, viewer_user, viewer_itinerary_user, itinerary, non_member_user
):
    member = connect(app, admin_client)
    member.emit("trip:join", {"trip_id": itinerary.id}, callback=True)

    outsider_http = app.test_client()
    with outsider_http.session_transaction() as sess:
        sess["user_id"] = non_member_user.id
    outsider = connect(app, outsider_http)
    outsider.emit("trip:join", {"trip_id": itinerary.id}, callback=True)

    member.get_received()
    socketio.emit("trip:changed", {"trip_id": itinerary.id}, to=f"trip:{itinerary.id}")

    assert [m["name"] for m in member.get_received()] == ["trip:changed"]
    assert outsider.get_received() == []


def test_signed_in_sockets_receive_their_own_user_notices(
    app, admin_client, admin_user, viewer_user
):
    mine = connect(app, admin_client)
    other_http = app.test_client()
    with other_http.session_transaction() as sess:
        sess["user_id"] = viewer_user.id
    other = connect(app, other_http)

    mine.get_received()
    other.get_received()
    socketio.emit("user:changed", {"entities": ["invite"]}, to=f"user:{admin_user.id}")

    assert [m["name"] for m in mine.get_received()] == ["user:changed"]
    assert other.get_received() == []


def test_anonymous_sockets_have_no_user_room(app, client, anonymous_itinerary):
    guest = connect(app, client, auth={"access_code": "secret-code"})
    guest.get_received()
    socketio.emit("user:changed", {"entities": ["invite"]}, to="user:None")

    assert guest.get_received() == []


def test_presence_tracks_viewing_day_and_cleans_up_on_disconnect(
    app, admin_client, viewer_user, viewer_itinerary_user, itinerary, admin_user
):
    first = connect(app, admin_client)
    first.emit("trip:join", {"trip_id": itinerary.id, "day": "2026-08-01"}, callback=True)

    second_http = app.test_client()
    with second_http.session_transaction() as sess:
        sess["user_id"] = viewer_user.id
    second = connect(app, second_http)
    second.emit("trip:join", {"trip_id": itinerary.id}, callback=True)

    presence = [m for m in first.get_received() if m["name"] == "presence:update"][-1]
    users = presence["args"][0]["users"]
    assert len(users) == 2
    assert {"user_id": admin_user.id, "name": admin_user.username, "day": "2026-08-01"} in users

    second.emit("presence:heartbeat", {"trip_id": itinerary.id, "day": "2026-08-02"})
    presence = [m for m in first.get_received() if m["name"] == "presence:update"][-1]
    assert {u["day"] for u in presence["args"][0]["users"]} == {"2026-08-01", "2026-08-02"}

    second.disconnect()
    presence = [m for m in first.get_received() if m["name"] == "presence:update"][-1]
    assert len(presence["args"][0]["users"]) == 1


def test_presence_store_ignores_stale_entries():
    store = PresenceStore(None, ttl=-1)
    store.set(1, "sid", {"user_id": 1, "name": "A"}, None)

    assert store.list_users(1) == []

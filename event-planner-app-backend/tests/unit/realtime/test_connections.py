from src.realtime.connections import UserConnectionStore


def test_user_is_connected_after_touch_and_not_after_remove():
    store = UserConnectionStore()

    assert not store.is_connected(1)
    store.touch(1, "sid-a")
    assert store.is_connected(1)
    store.remove(1, "sid-a")
    assert not store.is_connected(1)


def test_user_stays_connected_while_any_socket_remains():
    store = UserConnectionStore()
    store.touch(1, "sid-a")
    store.touch(1, "sid-b")

    store.remove(1, "sid-a")

    assert store.is_connected(1)


def test_entries_older_than_the_ttl_are_ignored():
    store = UserConnectionStore(ttl=-1)
    store.touch(1, "sid-a")

    assert not store.is_connected(1)

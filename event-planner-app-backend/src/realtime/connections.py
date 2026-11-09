import os
import threading
import time

CONNECTION_TTL_SECONDS = 90


class UserConnectionStore:
    """Which signed-in users have a live socket, on any instance.

    Backed by a Redis hash per user (field = socket id) so every instance sees the
    same picture; falls back to process memory without Redis. Entries older than
    the TTL are ignored, so a crashed instance cannot leave a user "online" forever.
    """

    def __init__(self, redis_url: str | None = None, ttl: int = CONNECTION_TTL_SECONDS):
        self.ttl = ttl
        self._redis = None
        self._memory: dict[int, dict[str, float]] = {}
        self._lock = threading.Lock()

        if redis_url and redis_url.startswith(("redis://", "rediss://")):
            import redis

            self._redis = redis.Redis.from_url(redis_url, decode_responses=True)

    @staticmethod
    def _key(user_id: int) -> str:
        return f"connections:user:{user_id}"

    def touch(self, user_id: int, sid: str):
        if self._redis is not None:
            key = self._key(user_id)
            pipe = self._redis.pipeline()
            pipe.hset(key, sid, time.time())
            pipe.expire(key, self.ttl)
            pipe.execute()
            return
        with self._lock:
            self._memory.setdefault(user_id, {})[sid] = time.time()

    def remove(self, user_id: int, sid: str):
        if self._redis is not None:
            self._redis.hdel(self._key(user_id), sid)
            return
        with self._lock:
            self._memory.get(user_id, {}).pop(sid, None)

    def is_connected(self, user_id: int) -> bool:
        cutoff = time.time() - self.ttl
        if self._redis is not None:
            entries = self._redis.hvals(self._key(user_id))
            return any(float(ts) >= cutoff for ts in entries)
        with self._lock:
            return any(ts >= cutoff for ts in self._memory.get(user_id, {}).values())


_store: UserConnectionStore | None = None


def get_connection_store() -> UserConnectionStore:
    global _store
    if _store is None:
        _store = UserConnectionStore(os.getenv("STORAGE_URI"))
    return _store


def reset_connection_store(store: UserConnectionStore | None = None):
    global _store
    _store = store

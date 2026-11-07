import json
import logging
import os
import threading
import time

logger = logging.getLogger(__name__)

PRESENCE_TTL_SECONDS = 60


class PresenceStore:
    """Who is connected to a trip and which day they are viewing.

    Backed by a Redis hash per trip (field = socket id) so every instance sees the
    same picture; falls back to process memory when no Redis URL is configured.
    Entries older than the TTL are ignored, so a crashed client disappears even if
    its disconnect never arrived.
    """

    def __init__(self, redis_url: str | None = None, ttl: int = PRESENCE_TTL_SECONDS):
        self.ttl = ttl
        self._redis = None
        self._memory: dict[int, dict[str, str]] = {}
        self._lock = threading.Lock()

        if redis_url and redis_url.startswith(("redis://", "rediss://")):
            import redis

            self._redis = redis.Redis.from_url(redis_url, decode_responses=True)

    @staticmethod
    def _key(trip_id: int) -> str:
        return f"presence:trip:{trip_id}"

    def set(self, trip_id: int, sid: str, user: dict, day: str | None):
        value = json.dumps({**user, "day": day, "ts": time.time()})
        if self._redis is not None:
            key = self._key(trip_id)
            pipe = self._redis.pipeline()
            pipe.hset(key, sid, value)
            pipe.expire(key, self.ttl)
            pipe.execute()
            return
        with self._lock:
            self._memory.setdefault(trip_id, {})[sid] = value

    def remove(self, trip_id: int, sid: str):
        if self._redis is not None:
            self._redis.hdel(self._key(trip_id), sid)
            return
        with self._lock:
            self._memory.get(trip_id, {}).pop(sid, None)

    def _entries(self, trip_id: int) -> dict[str, str]:
        if self._redis is not None:
            return self._redis.hgetall(self._key(trip_id))
        with self._lock:
            return dict(self._memory.get(trip_id, {}))

    def list_users(self, trip_id: int) -> list[dict]:
        """One entry per user (or guest), taking their most recent connection."""
        cutoff = time.time() - self.ttl
        latest: dict[str, dict] = {}

        for sid, raw in self._entries(trip_id).items():
            entry = json.loads(raw)
            if entry["ts"] < cutoff:
                self.remove(trip_id, sid)
                continue
            who = (
                f"user:{entry['user_id']}"
                if entry.get("user_id") is not None
                else f"guest:{sid}"
            )
            if who not in latest or entry["ts"] > latest[who]["ts"]:
                latest[who] = entry

        return [
            {"user_id": e.get("user_id"), "name": e["name"], "day": e.get("day")}
            for e in sorted(latest.values(), key=lambda e: e["ts"])
        ]


_store: PresenceStore | None = None


def get_presence_store() -> PresenceStore:
    global _store
    if _store is None:
        _store = PresenceStore(os.getenv("STORAGE_URI"))
    return _store


def reset_presence_store(store: PresenceStore | None = None):
    global _store
    _store = store

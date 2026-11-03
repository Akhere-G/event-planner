import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, ClassVar

from .ai_services import format_json, get_ai_response, to_trip_local, trip_local_to_utc
from .itineraries_service import get_itinerary

logger = logging.getLogger(__name__)

MAX_EDIT_OPS = 20
MAX_HISTORY_MESSAGES = 10


class EntityEditHandler(ABC):
    """Describes one editable entity to the AI and sanitises the ops it returns.

    To make another entity editable, add a subclass and list it in HANDLERS.
    """

    entity: ClassVar[str]
    fields: ClassVar[tuple[str, ...]]
    prompt_fields: ClassVar[str]

    def __init__(self, itinerary):
        self.itinerary = itinerary

    @abstractmethod
    def items(self) -> list: ...

    @abstractmethod
    def describe(self, item) -> str:
        """One prompt line for an existing item, starting with its id."""

    def ids(self) -> set[int]:
        return {item.id for item in self.items()}

    def prompt_section(self) -> str:
        lines = "\n".join(f"- id={item.id} | {self.describe(item)}" for item in self.items())
        return lines or "None"

    def normalise(self, data: dict) -> dict | None:
        """Adjust AI-provided fields (e.g. local to UTC). Return None to reject."""
        return data


class EventEditHandler(EntityEditHandler):
    entity = "event"
    fields = ("name", "description", "address", "start_at", "end_at", "category")
    prompt_fields = "name, description, address, start_at, end_at, category (max 10 characters)"

    def items(self):
        return self.itinerary.events

    def describe(self, event):
        tz = self.itinerary.timezone
        return (
            f"{event.name} | {to_trip_local(event.start_at, tz):%Y-%m-%dT%H:%M} to "
            f"{to_trip_local(event.end_at, tz):%Y-%m-%dT%H:%M} | {event.address}"
        )

    def normalise(self, data):
        try:
            converted = {
                key: trip_local_to_utc(data[key], self.itinerary.timezone)
                for key in ("start_at", "end_at")
                if key in data
            }
        except (TypeError, ValueError):
            return None
        if len(converted) == 2 and converted["end_at"] <= converted["start_at"]:
            return None
        return {**data, **{k: v.isoformat() for k, v in converted.items()}}


class AccommodationEditHandler(EntityEditHandler):
    entity = "accommodation"
    fields = ("name", "address", "description", "start_date", "end_date")
    prompt_fields = "name, address, description, start_date, end_date (YYYY-MM-DD)"

    def items(self):
        return self.itinerary.accommodations

    def describe(self, accommodation):
        return (
            f"{accommodation.name} | {accommodation.start_date} to "
            f"{accommodation.end_date} | {accommodation.address}"
        )


class PackingItemEditHandler(EntityEditHandler):
    entity = "packing_item"
    fields = ("name", "category", "is_shared", "is_checked")
    prompt_fields = "name, category, is_shared, is_checked"

    def items(self):
        return self.itinerary.packing_items

    def describe(self, item):
        return f"{item.name} | {item.category} | {'shared' if item.is_shared else 'personal'}"


class WishlistItemEditHandler(EntityEditHandler):
    entity = "wishlist_item"
    fields = ("name", "address", "description", "wishlist_name")
    prompt_fields = "name, address, description, wishlist_name (the list to add to)"

    def items(self):
        return [item for wishlist in self.itinerary.wishlists for item in wishlist.items]

    def describe(self, item):
        return f"{item.name} | list: {item.wishlist.name}"


HANDLER_CLASSES: tuple[type[EntityEditHandler], ...] = (
    EventEditHandler,
    AccommodationEditHandler,
    PackingItemEditHandler,
    WishlistItemEditHandler,
)
EDIT_OPS = ("create", "update", "delete")


def _format_history(history: list[dict]) -> str:
    lines = [
        f"{'Assistant' if m['role'] == 'assistant' else 'User'}: {m['content'].strip()}"
        for m in history[-MAX_HISTORY_MESSAGES:]
        if m["content"].strip()
    ]
    return "\n".join(lines) or "No earlier messages."


def _build_prompt(itinerary, handlers: dict[str, EntityEditHandler], message, history):
    timezone_name = itinerary.timezone
    sections = "\n\n".join(
        f"{h.entity.upper()}S:\n{h.prompt_section()}" for h in handlers.values()
    )
    field_docs = "\n".join(
        f"{h.entity} fields: {h.prompt_fields}." for h in handlers.values()
    )
    entities = " | ".join(handlers)
    return f"""
You are an assistant that edits a travel itinerary for a trip to {itinerary.destination}
({itinerary.start_date} to {itinerary.end_date}).

CURRENT TRIP (use these ids exactly; event times are local to {timezone_name}):

{sections}

CONVERSATION SO FAR:
{_format_history(history)}

USER REQUEST:
{message}

RULES:
1. Propose the smallest set of changes that satisfies the request.
2. Only update or delete items listed above, using their exact id. Never invent ids.
3. Event start_at and end_at MUST be local wall-clock times in the {timezone_name} timezone, formatted YYYY-MM-DDTHH:MM:SS with no offset or "Z". When moving an event, keep its duration unless told otherwise.
4. New events must be real venues with a real address.
5. If the request is ambiguous or you need more information, return no ops and ask one short clarifying question in "reply".
6. Return ONLY a JSON object, with no markdown.

JSON FORMAT:

{{
  "reply": "One or two friendly sentences summarising what you propose, or your clarifying question.",
  "ops": [
    {{
      "op": "create | update | delete",
      "entity": "{entities}",
      "id": 123,
      "data": {{"name": "..."}},
      "reason": "One short sentence (max 120 characters)"
    }}
  ]
}}

For updates, "data" holds only the changed fields. Omit "id" for create. Omit "data" for delete.
{field_docs}
"""


def _clean_op(raw: Any, handlers: dict[str, EntityEditHandler], ids: dict[str, set[int]]):
    """Return a sanitised op, or None if malformed or referring to another trip."""
    if not isinstance(raw, dict):
        return None
    kind, entity = raw.get("op"), raw.get("entity")
    handler = handlers.get(entity)
    if kind not in EDIT_OPS or handler is None:
        return None

    op_id = None
    if kind != "create":
        op_id = raw.get("id")
        if not isinstance(op_id, int) or isinstance(op_id, bool) or op_id not in ids[entity]:
            return None

    data: dict = {}
    if kind != "delete":
        raw_data = raw.get("data")
        if not isinstance(raw_data, dict):
            return None
        data = {k: v for k, v in raw_data.items() if k in handler.fields}
        if not data or (kind == "create" and not data.get("name")):
            return None
        data = handler.normalise(data)
        if data is None:
            return None

    reason = raw.get("reason")
    return {
        "op": kind,
        "entity": entity,
        "id": op_id,
        "data": data,
        "reason": reason.strip()[:200] if isinstance(reason, str) else None,
    }


def edit_trip_with_ai(
    itinerary_id: int, message: str, history: list[dict] | None = None
) -> dict[str, Any]:
    """Turn a natural-language edit request into change-set ops (nothing is saved).

    Returns {"reply": str, "ops": [...]} where ops use UTC datetimes.
    """
    itinerary = get_itinerary(itinerary_id)
    handlers = {cls.entity: cls(itinerary) for cls in HANDLER_CLASSES}

    parsed = format_json(
        get_ai_response(_build_prompt(itinerary, handlers, message, history or []))
    )
    if not isinstance(parsed, dict):
        raise ValueError("AI response must be a JSON object.")

    ids = {entity: handler.ids() for entity, handler in handlers.items()}
    raw_ops = parsed.get("ops")
    ops = [
        op
        for raw in (raw_ops if isinstance(raw_ops, list) else [])[:MAX_EDIT_OPS]
        if (op := _clean_op(raw, handlers, ids))
    ]

    reply = parsed.get("reply")
    if not isinstance(reply, str) or not reply.strip():
        reply = (
            "Here are the changes I suggest."
            if ops
            else "I couldn't work out a change for that. Could you rephrase?"
        )
    return {"reply": reply.strip()[:1000], "ops": ops}

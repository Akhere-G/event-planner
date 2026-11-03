import json
from unittest.mock import patch

from sqlalchemy import func, select
from src.extensions import db
from src.models import Accommodation, Event, PackingItem, Wishlist
from src.services.change_set_service import validate_ops
from tests.factories import EventFactory

PLAN = {
    "events": [
        {
            "name": "Louvre",
            "description": "Museum",
            "address": "Rue de Rivoli, Paris",
            "start_at": "2026-08-01T10:00:00",
            "end_at": "2026-08-01T12:00:00",
            "category": "Museum",
            "reason": "Matches your museum interest.",
        },
        {  # outside the trip dates: dropped
            "name": "Elsewhere",
            "description": "x",
            "address": "y",
            "start_at": "2026-09-01T10:00:00",
            "end_at": "2026-09-01T12:00:00",
            "category": "Museum",
        },
        {  # end before start: dropped
            "name": "Bad",
            "description": "x",
            "address": "y",
            "start_at": "2026-08-02T12:00:00",
            "end_at": "2026-08-02T10:00:00",
            "category": "Museum",
        },
    ],
    "accommodations": [
        {
            "name": "Hotel Paris",
            "address": "1 Rue",
            "start_date": "2026-07-30",
            "end_date": "2026-08-03",
            "reason": "Central.",
        }
    ],
    "packing_items": [
        {"name": "Umbrella", "category": "Misc", "is_shared": True, "reason": "Showers."},
        {"name": 5},
    ],
    "wishlist_items": [{"name": "Seine cruise", "reason": "Relaxing."}],
}
PLACE = {"latitude": 48.86, "longitude": 2.33, "formatted_address": "Paris, France"}


def counts(itinerary_id):
    return [
        db.session.execute(
            select(func.count()).select_from(model).where(
                model.itinerary_id == itinerary_id
            )
        ).scalar_one()
        for model in (Event, Accommodation, PackingItem, Wishlist)
    ]


def preview(client, itinerary_id):
    with (
        patch("src.services.ai_services.get_ai_response", return_value=json.dumps(PLAN)),
        patch("src.services.trip_generation_service.get_place_details", return_value=PLACE),
    ):
        return client.post(f"/api/ai/generate-trip/{itinerary_id}/preview")


def test_preview_returns_ops_and_saves_nothing(editor_client, itinerary):
    before = counts(itinerary.id)

    response = preview(editor_client, itinerary.id)

    assert response.status_code == 200
    ops = response.get_json()["data"]["ops"]
    assert [(o["entity"], o["op"]) for o in ops] == [
        ("accommodation", "create"),
        ("event", "create"),
        ("packing_item", "create"),
        ("wishlist_item", "create"),
    ]
    assert all(o["reason"] for o in ops)
    event_op = ops[1]["data"]
    assert event_op["startAt"] == "2026-08-01T08:00:00Z"  # Paris is UTC+2
    assert ops[0]["data"]["startDate"] == "2026-08-01"  # clamped to the trip
    assert ops[3]["data"]["wishlistName"] == "AI ideas"
    assert counts(itinerary.id) == before


def test_generated_ops_pass_change_set_validation(admin_client, itinerary):
    ops = preview(admin_client, itinerary.id).get_json()["data"]["ops"]
    snake = [
        {**o, "data": {_snake(k): v for k, v in o["data"].items()}} for o in ops
    ]
    assert len(validate_ops(itinerary.id, snake, None)) == len(ops)


def _snake(key):
    return "".join(f"_{c.lower()}" if c.isupper() else c for c in key)


def test_preview_viewer_forbidden(viewer_client, itinerary):
    with patch("src.routes.ai_routes.generate_trip_plan") as generate:
        response = viewer_client.post(f"/api/ai/generate-trip/{itinerary.id}/preview")
    assert response.status_code == 403
    generate.assert_not_called()


def test_preview_returns_empty_when_ai_fails(editor_client, itinerary):
    with patch(
        "src.services.ai_services.get_ai_response", side_effect=RuntimeError("down")
    ):
        response = editor_client.post(f"/api/ai/generate-trip/{itinerary.id}/preview")
    assert response.get_json()["data"]["ops"] == []


def test_unrelated_events_untouched(editor_client, itinerary):
    existing = EventFactory(itinerary=itinerary)
    preview(editor_client, itinerary.id)
    assert db.session.get(Event, existing.id) is not None


def test_ai_generation_limit_depends_on_login(app):
    from src.utils.rate_limit import ai_generation_limit

    with app.test_request_context():
        anonymous = ai_generation_limit()
    with app.test_request_context() as ctx:
        ctx.session["user_id"] = 1
        logged_in = ai_generation_limit()
    assert anonymous != logged_in


def test_failures_are_logged_with_trip_context(editor_client, itinerary, caplog):
    with patch(
        "src.services.ai_services.get_ai_response", return_value="[1, 2]"
    ), caplog.at_level("ERROR"):
        editor_client.post(f"/api/ai/generate-trip/{itinerary.id}/preview")

    assert f"Trip {itinerary.id}" in caplog.text

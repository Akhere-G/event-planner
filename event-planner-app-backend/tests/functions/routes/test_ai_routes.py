from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from sqlalchemy import func, select
from src.extensions import db
from src.models import Event

SUGGEST_BODY = {
    "date": "2026-08-20",
    "pace": "balanced",
    "companions": "couple",
    "transport": "walking",
    "interests": [],
}


def event_count(itinerary_id: int) -> int:
    return db.session.execute(
        select(func.count()).select_from(Event).where(Event.itinerary_id == itinerary_id)
    ).scalar_one()


@pytest.mark.parametrize(
    "path, body",
    [
        ("suggest-events", SUGGEST_BODY),
        ("optimise-events", {"date": "2026-08-20"}),
    ],
)
def test_ai_preview_routes_viewer_forbidden(viewer_client, itinerary, path, body):
    with (
        patch("src.routes.ai_routes.get_event_suggestions") as suggest,
        patch("src.routes.ai_routes.optimise_events") as optimise,
    ):
        response = viewer_client.post(
            f"/api/ai/{path}/{itinerary.id}/preview", json=body
        )

    assert response.status_code == 403
    suggest.assert_not_called()
    optimise.assert_not_called()


def test_suggest_events_preview_returns_ops_without_saving(editor_client, itinerary):
    suggestion = {
        "name": "Louvre",
        "description": "World famous museum",
        "address": "Rue de Rivoli, Paris",
        "latitude": 48.86,
        "longitude": 2.33,
        "start_at": "2026-08-20T08:00:00+00:00",
        "end_at": "2026-08-20T10:00:00+00:00",
        "category": "Museum",
        "reason": "Close to your hotel and matches your art interest.",
    }
    before = event_count(itinerary.id)

    with patch(
        "src.routes.ai_routes.get_event_suggestions", return_value=[suggestion]
    ):
        response = editor_client.post(
            f"/api/ai/suggest-events/{itinerary.id}/preview", json=SUGGEST_BODY
        )

    assert response.status_code == 200
    ops = response.get_json()["data"]["ops"]
    assert len(ops) == 1
    assert ops[0]["op"] == "create"
    assert ops[0]["entity"] == "event"
    assert ops[0]["reason"] == "Close to your hotel and matches your art interest."
    assert ops[0]["data"]["name"] == "Louvre"
    assert ops[0]["data"]["startAt"] == "2026-08-20T08:00:00Z"
    assert event_count(itinerary.id) == before


def test_optimise_events_preview_returns_update_ops_without_saving(
    editor_client, event
):
    updates = [
        {
            "id": event.id,
            "start_at": datetime(2026, 8, 20, 9, 0, tzinfo=timezone.utc),
            "end_at": datetime(2026, 8, 20, 11, 0, tzinfo=timezone.utc),
            "reason": "Avoids the morning queue.",
        }
    ]
    original_start = event.start_at

    with patch("src.routes.ai_routes.optimise_events", return_value=updates):
        response = editor_client.post(
            f"/api/ai/optimise-events/{event.itinerary_id}/preview",
            json={"date": "2026-08-20"},
        )

    assert response.status_code == 200
    ops = response.get_json()["data"]["ops"]
    assert ops == [
        {
            "op": "update",
            "entity": "event",
            "id": event.id,
            "data": {"startAt": "2026-08-20T09:00:00Z", "endAt": "2026-08-20T11:00:00Z"},
            "reason": "Avoids the morning queue.",
        }
    ]
    db.session.refresh(event)
    assert event.start_at.replace(tzinfo=None) == original_start.replace(tzinfo=None)


def test_optimise_events_preview_requires_date(editor_client, itinerary):
    response = editor_client.post(
        f"/api/ai/optimise-events/{itinerary.id}/preview", json={}
    )
    assert response.status_code == 400

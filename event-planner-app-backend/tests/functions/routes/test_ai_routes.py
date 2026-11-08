from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from sqlalchemy import func, select
from src.extensions import db
from src.models import Event

def event_count(itinerary_id: int) -> int:
    return db.session.execute(
        select(func.count()).select_from(Event).where(Event.itinerary_id == itinerary_id)
    ).scalar_one()


def test_optimise_preview_viewer_forbidden(viewer_client, itinerary):
    with patch("src.routes.ai_routes.optimise_events") as optimise:
        response = viewer_client.post(
            f"/api/ai/optimise-events/{itinerary.id}/preview",
            json={"date": "2026-08-20"},
        )

    assert response.status_code == 403
    optimise.assert_not_called()


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

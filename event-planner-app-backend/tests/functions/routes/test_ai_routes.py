from unittest.mock import patch

import pytest


@pytest.mark.parametrize(
    "path, body",
    [
        (
            "suggest-events",
            {
                "date": "2026-08-20",
                "pace": "balanced",
                "companions": "couple",
                "transport": "walking",
                "interests": [],
            },
        ),
        ("optimise-events", {"date": "2026-08-20"}),
    ],
)
def test_ai_event_routes_viewer_forbidden(viewer_client, itinerary, path, body):
    with (
        patch("src.routes.ai_routes.get_event_suggestions") as suggest,
        patch("src.routes.ai_routes.optimise_events") as optimise,
    ):
        response = viewer_client.post(f"/api/ai/{path}/{itinerary.id}", json=body)

    assert response.status_code == 403
    suggest.assert_not_called()
    optimise.assert_not_called()


def test_optimise_events_editor_allowed(editor_client, itinerary):
    with patch("src.routes.ai_routes.optimise_events", return_value=[]):
        response = editor_client.post(
            f"/api/ai/optimise-events/{itinerary.id}", json={"date": "2026-08-20"}
        )

    assert response.status_code == 200

import json
from unittest.mock import patch

from sqlalchemy import func, select
from src.extensions import db
from src.models import Itinerary, ItineraryUser, TripPreferences

from tests.sample_plans import PLACE, PLAN

QUESTION = {
    "reply": "When are you travelling?",
    "ready": False,
    "trip": {"destination": "Paris, France"},
    "preferences": {"trip_type": "couple", "pace": "not-a-pace"},
}
READY = {
    "reply": "Here is a draft for Paris.",
    "ready": True,
    "trip": {
        "name": "Paris break",
        "destination": "Paris, France",
        "start_date": "2026-08-01",
        "end_date": "2026-08-03",
    },
    "preferences": {"trip_type": "couple", "group_size": 2},
}
BODY = {"message": "Paris please", "history": []}


def chat(client, builder_reply):
    with (
        patch(
            "src.services.trip_builder_service.get_ai_response",
            return_value=json.dumps(builder_reply),
        ),
        patch(
            "src.services.ai_services.get_ai_response", return_value=json.dumps(PLAN)
        ),
        patch(
            "src.services.trip_builder_service.get_destination_coordinates",
            return_value={"latitude": 48.86, "longitude": 2.33},
        ),
        patch(
            "src.services.trip_builder_service.resolve_trip_timezone",
            return_value="Europe/Paris",
        ),
        patch(
            "src.services.trip_generation_service.get_place_details",
            return_value=PLACE,
        ),
    ):
        return client.post("/api/ai/trip-builder/chat", json=BODY)


def trip_count() -> int:
    return db.session.execute(select(func.count()).select_from(Itinerary)).scalar_one()


def test_chat_asks_for_missing_details_when_logged_out(client):
    before = trip_count()

    response = chat(client, QUESTION)

    data = response.get_json()["data"]
    assert response.status_code == 200
    assert data["missing"] == ["start_date", "end_date"]
    assert data["preferencesSoFar"] == {
        "destination": "Paris, France",
        "tripType": "couple",
    }
    assert "draft" not in data
    assert trip_count() == before


def test_chat_returns_a_draft_without_saving_it(client):
    before = trip_count()

    response = chat(client, READY)

    draft = response.get_json()["data"]["draft"]
    assert response.status_code == 200
    assert draft["trip"]["destination"] == "Paris, France"
    assert draft["trip"]["latitude"] == 48.86
    assert draft["preferences"] == {"tripType": "couple", "groupSize": 2}
    assert {op["entity"] for op in draft["ops"]} >= {"event", "accommodation"}
    assert trip_count() == before


def draft_body(ops=None):
    return {
        "trip": {
            "name": "Paris break",
            "destination": "Paris, France",
            "latitude": 48.86,
            "longitude": 2.33,
            "startDate": "2026-08-01",
            "endDate": "2026-08-03",
        },
        "preferences": {"tripType": "couple", "groupSize": 2},
        "ops": ops
        or [
            {
                "op": "create",
                "entity": "packing_item",
                "data": {"name": "Umbrella", "category": "Misc"},
            }
        ],
    }


def post_draft(client, body):
    with patch(
        "src.services.itineraries_service.get_timezone_for_coordinates",
        return_value="Europe/Paris",
    ):
        return client.post("/api/itineraries/from-draft", json=body)


def test_from_draft_creates_trip_preferences_and_items_for_a_member(
    auth_client, admin_user
):
    response = post_draft(auth_client, draft_body())

    trip = response.get_json()["data"]
    assert response.status_code == 201
    assert trip["timezone"] == "Europe/Paris"
    assert db.session.execute(
        select(ItineraryUser).where(
            ItineraryUser.itinerary_id == trip["id"],
            ItineraryUser.user_id == admin_user.id,
        )
    ).scalar_one()
    assert (
        db.session.execute(
            select(TripPreferences.group_size).where(
                TripPreferences.itinerary_id == trip["id"]
            )
        ).scalar_one()
        == 2
    )


def test_from_draft_gives_logged_out_users_an_access_code(client):
    response = post_draft(client, draft_body())

    trip = response.get_json()["data"]
    assert response.status_code == 201
    assert trip["isAnonymous"] is True
    assert trip["anonymousAccessCode"]


def test_from_draft_creates_nothing_when_an_op_is_invalid(client):
    before = trip_count()
    invalid = {"op": "create", "entity": "event", "data": {"name": "No times"}}

    response = post_draft(client, draft_body([invalid]))

    assert response.status_code == 400
    assert trip_count() == before


def test_trip_builder_limits_are_stricter_when_logged_out(app):
    from src.utils.rate_limit import trip_builder_daily_limit, trip_builder_hourly_limit

    with app.test_request_context():
        anonymous = (trip_builder_hourly_limit(), trip_builder_daily_limit())
    with app.test_request_context() as ctx:
        ctx.session["user_id"] = 1
        logged_in = (trip_builder_hourly_limit(), trip_builder_daily_limit())
    assert anonymous != logged_in

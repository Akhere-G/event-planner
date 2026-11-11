import json
from unittest.mock import patch

import pytest
from marshmallow import ValidationError
from sqlalchemy import func, select
from src.exceptions import AiTaskQueueError
from src.extensions import db
from src.models import (
    AiTask,
    AiTaskStatus,
    Itinerary,
    ItineraryUser,
    TripPreferences,
    UserRole,
)

URL = "/api/itineraries/from-prompt"
AI = "src.services.trip_prompt_service.get_ai_response"
PLACE_LOOKUP = "src.services.trip_builder_service.get_place_details"
TIMEZONE_LOOKUP = "src.services.trip_builder_service.get_timezone_for_trip"
PLAN = "src.ai_tasks.handlers.generate_trip.generate_trip_plan"
QUEUE = "src.services.trip_builder_service.enqueue"

BRIEF = {
    "name": "Lisbon food weekend",
    "destination": "Lisbon",
    "start_date": "2026-06-05",
    "end_date": "2026-06-08",
    "budget_amount_gbp": 900,
    "preferences": {"trip_type": "couple", "vibes": ["foodie"]},
}
LISBON = {
    "latitude": 38.72,
    "longitude": -9.14,
    "formatted_address": "Lisbon, Portugal",
}
PROPOSED_OPS = [
    {"op": "create", "entity": "packing_item", "data": {"name": "Sun cream"}}
]


@pytest.fixture(autouse=True)
def lisbon_trip_plan():
    with (
        patch(AI, return_value=json.dumps(BRIEF)),
        patch(PLACE_LOOKUP, return_value=LISBON),
        patch(TIMEZONE_LOOKUP, return_value="Europe/Lisbon"),
        patch(PLAN, return_value=PROPOSED_OPS),
    ):
        yield


def trip_count():
    return db.session.scalar(select(func.count()).select_from(Itinerary))


def plan_tasks(itinerary_id):
    stmt = select(AiTask).where(AiTask.itinerary_id == itinerary_id)
    return db.session.execute(stmt).scalars().all()


def test_a_prompt_creates_the_trip_with_its_preferences(auth_client, admin_user):
    response = auth_client.post(URL, json={"prompt": "A foodie weekend in Lisbon"})

    assert response.status_code == 201
    trip = db.session.get(Itinerary, response.get_json()["data"]["id"])
    assert trip.name == "Lisbon food weekend"
    assert trip.destination == "Lisbon, Portugal"
    assert trip.timezone == "Europe/Lisbon"
    assert str(trip.start_date) == "2026-06-05"
    assert float(trip.budget_amount_gbp) == 900
    preferences = db.session.execute(
        select(TripPreferences).where(TripPreferences.itinerary_id == trip.id)
    ).scalar_one()
    assert preferences.trip_type == "couple"
    assert preferences.vibes == ["foodie"]
    membership = db.session.execute(
        select(ItineraryUser).where(ItineraryUser.itinerary_id == trip.id)
    ).scalar_one()
    assert membership.user_id == admin_user.id
    assert membership.role == UserRole.ADMIN.value


def test_the_plan_is_proposed_in_the_background(auth_client, admin_user):
    response = auth_client.post(URL, json={"prompt": "A foodie weekend in Lisbon"})

    (task,) = plan_tasks(response.get_json()["data"]["id"])
    assert task.type == "generate_trip"
    assert task.status == AiTaskStatus.READY.value
    assert task.result_ops == PROPOSED_OPS
    assert task.created_by_id == admin_user.id


def test_a_logged_out_visitor_gets_an_access_code_for_the_trip(client):
    response = client.post(URL, json={"prompt": "A foodie weekend in Lisbon"})

    data = response.get_json()["data"]
    assert response.status_code == 201
    assert data["isAnonymous"]
    assert data["anonymousAccessCode"]
    (task,) = plan_tasks(data["id"])
    assert task.created_by_id is None


def test_an_unknown_destination_creates_nothing(auth_client):
    before = trip_count()
    with patch(
        PLACE_LOOKUP, side_effect=ValidationError({"address": ["Cannot find place."]})
    ):
        response = auth_client.post(URL, json={"prompt": "A weekend in Atlantis"})

    assert response.status_code == 400
    assert "prompt" in response.get_json()["error"]
    assert trip_count() == before


def test_a_prompt_without_a_destination_creates_nothing(auth_client):
    before = trip_count()
    with patch(AI, return_value=json.dumps({**BRIEF, "destination": None})):
        response = auth_client.post(URL, json={"prompt": "Somewhere nice"})

    assert response.status_code == 400
    assert "prompt" in response.get_json()["error"]
    assert trip_count() == before


@pytest.mark.parametrize("body", [{}, {"prompt": ""}, {"prompt": "x" * 1001}])
def test_an_unusable_prompt_is_rejected(auth_client, body):
    assert auth_client.post(URL, json=body).status_code == 400


def test_the_trip_is_still_returned_when_the_plan_cannot_be_queued(auth_client):
    with patch(QUEUE, side_effect=AiTaskQueueError()):
        response = auth_client.post(URL, json={"prompt": "A foodie weekend in Lisbon"})

    assert response.status_code == 201

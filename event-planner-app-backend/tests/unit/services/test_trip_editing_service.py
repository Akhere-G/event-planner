import json
from unittest.mock import patch

import pytest
from sqlalchemy import select
from src.ai_tasks import snapshots
from src.exceptions import AIResponseError
from src.extensions import db
from src.models import AiTask, AiTaskStatus, Event
from src.services.trip_editing_service import (
    REPLY_WITHOUT_CHANGES,
    REPLY_WITH_CHANGES,
    edit_trip_with_ai,
)
from tests.factories import EventFactory, ItineraryFactory

AI = "src.services.trip_editing_service.get_ai_response"
PLACE = {"latitude": 48.86, "longitude": 2.33, "address": "Rue de Rivoli, Paris"}


def fake_ai(reply):
    prompts = []

    def respond(prompt):
        prompts.append(prompt)
        return reply if isinstance(reply, str) else json.dumps(reply)

    respond.prompts = prompts
    return respond


def move(event, start="2026-08-20T19:00:00", end="2026-08-20T21:00:00"):
    return {
        "reply": "Moved it to 7pm.",
        "ops": [
            {
                "op": "update",
                "entity": "event",
                "id": event.id,
                "data": {"start_at": start, "end_at": end},
                "reason": "Later dinner",
            }
        ],
    }


def proposals(itinerary):
    stmt = select(AiTask).where(AiTask.itinerary_id == itinerary.id)
    return db.session.execute(stmt).scalars().all()


def test_a_request_becomes_a_ready_proposal_and_changes_nothing(
    itinerary, event, editor_user
):
    with patch(AI, fake_ai(move(event))):
        result = edit_trip_with_ai(itinerary.id, editor_user.id, "Dinner at 7", [])

    task = result.task
    assert result.reply == "Moved it to 7pm."
    assert task.status == AiTaskStatus.READY.value
    assert task.type == "edit_trip"
    assert task.created_by_id == editor_user.id
    assert task.params == {"message": "Dinner at 7"}
    assert task.result_ops[0]["data"] == {
        "start_at": "2026-08-20T17:00:00Z",
        "end_at": "2026-08-20T19:00:00Z",
    }
    assert "base" in task.result_ops[0]
    db.session.refresh(event)
    assert event.start_at.hour == 10


def test_the_model_sees_the_trips_items_the_request_and_the_history(itinerary, event):
    ai = fake_ai({"reply": "Which one?", "ops": []})
    history = [{"role": "user", "content": "Hi"}]

    with patch(AI, ai):
        edit_trip_with_ai(itinerary.id, None, "Move dinner", history)

    assert f"id={event.id}" in ai.prompts[0]
    assert "Move dinner" in ai.prompts[0]
    assert "User: Hi" in ai.prompts[0]


def test_a_clarifying_reply_creates_no_proposal(itinerary, event):
    reply = {"reply": "Which dinner do you mean?", "ops": []}

    with patch(AI, fake_ai(reply)):
        result = edit_trip_with_ai(itinerary.id, None, "Move dinner", [])

    assert result.reply == "Which dinner do you mean?"
    assert result.task is None
    assert proposals(itinerary) == []


def test_a_missing_reply_gets_a_default(itinerary, event):
    with patch(AI, fake_ai({"ops": None})):
        assert edit_trip_with_ai(itinerary.id, None, "?", []).reply == (
            REPLY_WITHOUT_CHANGES
        )

    with patch(AI, fake_ai({"ops": move(event)["ops"]})):
        assert edit_trip_with_ai(itinerary.id, None, "?", []).reply == (
            REPLY_WITH_CHANGES
        )


def test_an_item_of_another_trip_is_ignored(itinerary, event):
    foreign = EventFactory(itinerary=ItineraryFactory())

    with patch(AI, fake_ai(move(foreign))):
        result = edit_trip_with_ai(itinerary.id, None, "Move it", [])

    assert result.task is None
    assert proposals(itinerary) == []


def test_a_created_event_is_geocoded_into_the_proposal(itinerary):
    reply = {
        "reply": "Added the Louvre.",
        "ops": [
            {
                "op": "create",
                "entity": "event",
                "data": {
                    "name": "Louvre",
                    "category": "Museum",
                    "start_at": "2026-08-02T10:00:00",
                    "end_at": "2026-08-02T12:00:00",
                },
            }
        ],
    }
    geocode = "src.services.trip_edit.entity_editors.geocode"

    with patch(AI, fake_ai(reply)), patch(geocode, return_value=PLACE):
        result = edit_trip_with_ai(itinerary.id, None, "Add the Louvre", [])

    data = result.task.result_ops[0]["data"]
    assert data["latitude"] == 48.86
    assert data["start_at"] == "2026-08-02T08:00:00Z"
    names = db.session.execute(
        select(Event.name).where(Event.itinerary_id == itinerary.id)
    )
    assert "Louvre" not in names.scalars().all()


def test_an_edit_made_while_the_model_thinks_makes_the_proposal_stale(itinerary, event):
    def edit_during_the_call(prompt):
        event.name = "Renamed meanwhile"
        db.session.flush()
        return json.dumps(move(event))

    with patch(AI, edit_during_the_call):
        result = edit_trip_with_ai(itinerary.id, None, "Dinner at 7", [])

    stale = snapshots.find_stale(itinerary.id, result.task.result_ops)
    assert stale == {0: snapshots.Staleness.CHANGED}


@pytest.mark.parametrize("reply", ["[]", '"hello"', "not json"])
def test_a_reply_that_is_not_an_object_is_an_error(itinerary, reply):
    with patch(AI, fake_ai(reply)), pytest.raises(AIResponseError):
        edit_trip_with_ai(itinerary.id, None, "Move dinner", [])

import json
from datetime import date
from unittest.mock import patch

import pytest
from sqlalchemy import select
from src.extensions import db
from src.models import (
    Accommodation,
    AiTask,
    AiTaskStatus,
    Event,
    PackingItem,
    Wishlist,
    WishlistItem,
)
from tests.factories import (
    EventFactory,
    ItineraryFactory,
    WishlistItemFactory,
)

AI = "src.services.trip_editing_service.get_ai_response"
EVENT_PLACE = "src.services.trip_edit.entity_editors.geocode"
STAY_PLACE = "src.services.accommodation_service.get_place_details"
PLACE = {"latitude": 48.86, "longitude": 2.33, "address": "Rue de Rivoli, Paris"}


def edit_url(itinerary):
    return f"/api/ai/edit-trip/{itinerary.id}"


def ask(client, itinerary, reply, message="Change it", **extra):
    body = reply if isinstance(reply, str) else json.dumps(reply)
    with patch(AI, return_value=body):
        return client.post(edit_url(itinerary), json={"message": message}, **extra)


def accept(client, itinerary, task_id, indexes, **extra):
    return client.post(
        f"/api/itineraries/{itinerary.id}/ai-tasks/{task_id}/accept",
        json={"opIndexes": indexes},
        **extra,
    )


def move(event):
    data = {"start_at": "2026-08-20T19:00:00", "end_at": "2026-08-20T21:00:00"}
    op = {"op": "update", "entity": "event", "id": event.id, "data": data}
    return {"reply": "Moved it to 7pm.", "ops": [op]}


@pytest.fixture
def stay(itinerary, admin_user):
    stay = Accommodation(
        itinerary_id=itinerary.id,
        name="Hotel Old",
        address="1 Rue Cler, Paris",
        latitude=48.85,
        longitude=2.30,
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 3),
        created_by_id=admin_user.id,
        updated_by_id=admin_user.id,
    )
    db.session.add(stay)
    db.session.flush()
    return stay


@pytest.fixture
def packing_item(itinerary, admin_user):
    item = PackingItem(
        itinerary_id=itinerary.id,
        name="Umbrella",
        category="Weather",
        is_shared=True,
        created_by_id=admin_user.id,
        updated_by_id=admin_user.id,
    )
    db.session.add(item)
    db.session.flush()
    return item


@pytest.fixture
def idea(wishlist):
    return WishlistItemFactory(wishlist=wishlist, name="Old idea")


def names(model, itinerary):
    stmt = select(model.name)
    if model is WishlistItem:
        stmt = stmt.join(Wishlist).where(Wishlist.itinerary_id == itinerary.id)
    else:
        stmt = stmt.where(model.itinerary_id == itinerary.id)
    return set(db.session.execute(stmt).scalars())


def proposals(itinerary):
    stmt = select(AiTask).where(AiTask.itinerary_id == itinerary.id)
    return db.session.execute(stmt).scalars().all()


def test_a_request_returns_a_reply_and_a_proposal(editor_client, itinerary, event):
    response = ask(editor_client, itinerary, move(event), "Dinner at 7")

    data = response.get_json()["data"]
    assert response.status_code == 200
    assert data["reply"] == "Moved it to 7pm."
    assert data["task"]["status"] == "ready"
    assert data["task"]["type"] == "edit_trip"
    assert data["task"]["opCount"] == 1


def test_nothing_is_saved_until_the_proposal_is_accepted(
    editor_client, itinerary, event
):
    task_id = ask(editor_client, itinerary, move(event)).get_json()["data"]["task"][
        "id"
    ]

    db.session.refresh(event)
    assert event.start_at.hour == 10

    response = accept(editor_client, itinerary, task_id, [0])

    assert response.status_code == 200
    db.session.refresh(event)
    assert event.start_at.hour == 17
    assert db.session.get(AiTask, task_id).status == AiTaskStatus.ACCEPTED.value


def test_an_ambiguous_request_gets_a_question_and_no_proposal(
    editor_client, itinerary, event
):
    reply = {"reply": "Which dinner do you mean?", "ops": []}

    response = ask(editor_client, itinerary, reply)

    data = response.get_json()["data"]
    assert data["reply"] == "Which dinner do you mean?"
    assert data["task"] is None
    assert proposals(itinerary) == []


def test_an_item_of_another_trip_is_ignored(editor_client, itinerary, event):
    foreign = EventFactory(itinerary=ItineraryFactory())

    response = ask(editor_client, itinerary, move(foreign))

    assert response.get_json()["data"]["task"] is None
    db.session.refresh(foreign)
    assert foreign.start_at.hour == 10


def test_every_entity_can_be_added(editor_client, itinerary):
    reply = {
        "reply": "Added four things.",
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
            },
            {
                "op": "create",
                "entity": "accommodation",
                "data": {
                    "name": "Hotel New",
                    "address": "2 Rue Cler, Paris",
                    "start_date": "2026-08-01",
                    "end_date": "2026-08-03",
                },
            },
            {
                "op": "create",
                "entity": "packing_item",
                "data": {"name": "Sunscreen", "category": "Health"},
            },
            {
                "op": "create",
                "entity": "wishlist_item",
                "data": {"name": "Orsay", "wishlist_name": "Museums"},
            },
        ],
    }

    with patch(EVENT_PLACE, return_value=PLACE), patch(STAY_PLACE, return_value=PLACE):
        task_id = ask(editor_client, itinerary, reply).get_json()["data"]["task"]["id"]
        response = accept(editor_client, itinerary, task_id, [0, 1, 2, 3])

    assert response.get_json()["data"]["applied"]["created"] == 4
    assert "Louvre" in names(Event, itinerary)
    assert "Hotel New" in names(Accommodation, itinerary)
    assert "Sunscreen" in names(PackingItem, itinerary)
    assert "Orsay" in names(WishlistItem, itinerary)


def existing_items(event, stay, packing_item, idea):
    return (
        ("event", event),
        ("accommodation", stay),
        ("packing_item", packing_item),
        ("wishlist_item", idea),
    )


def test_every_entity_can_be_changed(
    editor_client, itinerary, event, stay, packing_item, idea
):
    ops = []
    for entity, item in existing_items(event, stay, packing_item, idea):
        data = {"name": "Renamed"}
        ops.append({"op": "update", "entity": entity, "id": item.id, "data": data})

    reply = {"reply": "Renamed four things.", "ops": ops}
    task_id = ask(editor_client, itinerary, reply).get_json()["data"]["task"]["id"]
    response = accept(editor_client, itinerary, task_id, [0, 1, 2, 3])

    assert response.get_json()["data"]["applied"]["updated"] == 4
    for model in (Event, Accommodation, PackingItem, WishlistItem):
        assert "Renamed" in names(model, itinerary)


def test_every_entity_can_be_removed(
    editor_client, itinerary, event, stay, packing_item, idea
):
    ops = []
    for entity, item in existing_items(event, stay, packing_item, idea):
        ops.append({"op": "delete", "entity": entity, "id": item.id})

    reply = {"reply": "Removed four things.", "ops": ops}
    task_id = ask(editor_client, itinerary, reply).get_json()["data"]["task"]["id"]
    response = accept(editor_client, itinerary, task_id, [0, 1, 2, 3])

    assert response.get_json()["data"]["applied"]["deleted"] == 4
    for model in (Event, Accommodation, PackingItem, WishlistItem):
        assert names(model, itinerary) == set()


def test_admins_can_edit_too(admin_client, itinerary, event):
    assert ask(admin_client, itinerary, move(event)).status_code == 200


def test_viewers_cannot_edit(viewer_client, itinerary, event):
    response = ask(viewer_client, itinerary, move(event))

    assert response.status_code == 403
    assert proposals(itinerary) == []


def test_non_members_cannot_edit(non_member_client, itinerary, event):
    assert ask(non_member_client, itinerary, move(event)).status_code in (401, 403, 404)


def test_an_anonymous_trip_can_be_edited_with_its_access_code(client):
    trip = ItineraryFactory(is_anonymous=True, anonymous_access_code="secret")
    event = EventFactory(itinerary=trip)
    headers = {"headers": {"X-Itinerary-Access-Code": "secret"}}

    response = ask(client, trip, move(event), **headers)

    assert response.status_code == 200
    task_id = response.get_json()["data"]["task"]["id"]
    assert db.session.get(AiTask, task_id).created_by_id is None
    assert accept(client, trip, task_id, [0], **headers).status_code == 200


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"message": ""},
        {"message": "x" * 501},
        {"message": "Hi", "history": [{"role": "system", "content": "Hi"}]},
        {"message": "Hi", "history": [{"role": "user"}]},
    ],
)
def test_a_bad_request_is_rejected(editor_client, itinerary, body):
    with patch(AI) as ai:
        response = editor_client.post(edit_url(itinerary), json=body)

    assert response.status_code == 400
    ai.assert_not_called()


def test_a_reply_the_ai_cannot_be_parsed_is_a_bad_gateway(editor_client, itinerary):
    assert ask(editor_client, itinerary, "not json").status_code == 502

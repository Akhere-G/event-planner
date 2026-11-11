from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy import func, select
from src.extensions import db
from src.models import Expense


@pytest.fixture
def base(itinerary):
    return f"/api/itineraries/{itinerary.id}/expenses"


@pytest.fixture
def members(admin_itinerary_user, editor_itinerary_user, viewer_itinerary_user):
    return [admin_itinerary_user, editor_itinerary_user, viewer_itinerary_user]


def payload(**kw):
    body = {
        "description": "Dinner",
        "amount": 30,
        "spentOn": "2026-08-01",
        "category": "food",
        "splitType": "even_all",
    }
    body.update(kw)
    return body


def test_admin_creates_even_split(admin_client, base, members, admin_user):
    res = admin_client.post(base, json=payload())
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert data["amountGbp"] == 30
    assert data["paidById"] == admin_user.id
    assert [s["amountGbp"] for s in data["shares"]] == [10, 10, 10]
    expense = db.session.get(Expense, data["id"])
    assert expense.created_by_id == admin_user.id
    assert expense.updated_by_id == admin_user.id


def test_remainder_goes_to_payer_in_route(editor_client, base, members, editor_user):
    res = editor_client.post(base, json=payload(amount=10))
    assert res.status_code == 201
    shares = {s["userId"]: s["amountGbp"] for s in res.get_json()["data"]["shares"]}
    assert shares[editor_user.id] == 3.34
    assert round(sum(shares.values()), 2) == 10


def test_selected_split(admin_client, base, members, admin_user, editor_user):
    res = admin_client.post(
        base,
        json=payload(
            splitType="selected", participantIds=[admin_user.id, editor_user.id]
        ),
    )
    assert res.status_code == 201
    assert len(res.get_json()["data"]["shares"]) == 2


def test_selected_requires_participants(admin_client, base, members):
    res = admin_client.post(base, json=payload(splitType="selected"))
    assert res.status_code == 400


def test_self_split(admin_client, base, members, admin_user):
    res = admin_client.post(base, json=payload(splitType="self"))
    shares = res.get_json()["data"]["shares"]
    assert shares == [{"userId": admin_user.id, "amountGbp": 30}]


@pytest.mark.parametrize("currency", ["XXX", "BGN", "eur"])
def test_unsupported_currency_rejected(
    admin_client, base, members, rate_provider, currency
):
    res = admin_client.post(base, json=payload(currency=currency))
    assert res.status_code == 400
    assert rate_provider.lookups == []


def test_gbp_expense_needs_no_rate(admin_client, base, members, rate_provider):
    res = admin_client.post(base, json=payload())
    assert res.get_json()["data"]["fxRate"] == 1
    assert rate_provider.lookups == []


def create_euro_expense(client, base, **kw):
    res = client.post(base, json=payload(currency="EUR", amount=40, **kw))
    assert res.status_code == 201
    return res.get_json()["data"]


def test_foreign_expense_is_converted_at_the_spend_date_rate(
    admin_client, base, members, rate_provider
):
    data = create_euro_expense(admin_client, base)

    assert data["amount"] == 40
    assert data["currency"] == "EUR"
    assert data["fxRate"] == 0.85
    assert data["amountGbp"] == 34
    assert sum(share["amountGbp"] for share in data["shares"]) == 34
    assert rate_provider.lookups == [("EUR", "GBP", date(2026, 8, 1))]


def test_changing_the_date_fetches_that_day_s_rate(
    admin_client, base, members, rate_provider
):
    expense = create_euro_expense(admin_client, base)
    rate_provider.rate = Decimal("0.9")

    res = admin_client.patch(f"{base}/{expense['id']}", json={"spentOn": "2026-08-05"})

    data = res.get_json()["data"]
    assert data["fxRate"] == 0.9
    assert data["amountGbp"] == 36
    assert sum(share["amountGbp"] for share in data["shares"]) == 36


def test_changing_the_amount_keeps_the_rate_even_when_rates_are_down(
    admin_client, base, members, rate_provider
):
    expense = create_euro_expense(admin_client, base)
    rate_provider.down = True

    res = admin_client.patch(f"{base}/{expense['id']}", json={"amount": 50})

    data = res.get_json()["data"]
    assert res.status_code == 200
    assert data["fxRate"] == 0.85
    assert data["amountGbp"] == 42.5


def test_editing_something_else_keeps_the_currency(
    admin_client, base, members, rate_provider
):
    expense = create_euro_expense(admin_client, base)

    res = admin_client.patch(f"{base}/{expense['id']}", json={"description": "Lunch"})

    data = res.get_json()["data"]
    assert data["currency"] == "EUR"
    assert data["amountGbp"] == 34


def test_switching_back_to_gbp_drops_the_conversion(
    admin_client, base, members, rate_provider
):
    expense = create_euro_expense(admin_client, base)

    res = admin_client.patch(f"{base}/{expense['id']}", json={"currency": "GBP"})

    data = res.get_json()["data"]
    assert data["fxRate"] == 1
    assert data["amountGbp"] == 40


def test_rates_being_down_blocks_a_foreign_expense_and_saves_nothing(
    admin_client, base, members, rate_provider, itinerary
):
    rate_provider.down = True

    res = admin_client.post(base, json=payload(currency="EUR"))

    assert res.status_code == 503
    saved = select(func.count()).where(Expense.itinerary_id == itinerary.id)
    assert db.session.scalar(saved) == 0


def test_negative_amount_rejected(admin_client, base, members):
    res = admin_client.post(base, json=payload(amount=-5))
    assert res.status_code in (400, 422)


def test_payer_must_be_member(admin_client, base, members, non_member_user):
    res = admin_client.post(base, json=payload(paidById=non_member_user.id))
    assert res.status_code == 400


def test_link_to_event(admin_client, base, members, event):
    res = admin_client.post(base, json=payload(eventId=event.id))
    assert res.status_code == 201
    assert res.get_json()["data"]["eventId"] == event.id


def test_link_to_both_rejected(admin_client, base, members, event):
    res = admin_client.post(base, json=payload(eventId=event.id, accommodationId=1))
    assert res.status_code == 400


def test_link_to_flight(admin_client, base, members, flight):
    res = admin_client.post(base, json=payload(flightId=flight.id))
    assert res.status_code == 201
    assert res.get_json()["data"]["flightId"] == flight.id


def test_link_to_event_and_flight_rejected(admin_client, base, members, event, flight):
    res = admin_client.post(base, json=payload(eventId=event.id, flightId=flight.id))
    assert res.status_code == 400


def test_link_to_other_trips_flight_rejected(admin_client, base, members):
    from tests.factories import FlightFactory

    other = FlightFactory()
    res = admin_client.post(base, json=payload(flightId=other.id))
    assert res.status_code == 400
    assert "not part of this trip" in res.get_json()["message"]


@pytest.mark.parametrize("link", ["event", "flight"])
def test_second_expense_on_an_item_is_rejected(
    admin_client, base, members, event, flight, itinerary, link
):
    item = {"event": ("eventId", event), "flight": ("flightId", flight)}[link]
    body = payload(**{item[0]: item[1].id})
    assert admin_client.post(base, json=body).status_code == 201

    res = admin_client.post(base, json=body)

    assert res.status_code == 400
    assert "already has an expense" in res.get_json()["message"]
    assert db.session.query(Expense).filter_by(itinerary_id=itinerary.id).count() == 1


def test_expense_can_be_edited_without_tripping_the_one_per_item_rule(
    admin_client, base, members, flight
):
    created = admin_client.post(base, json=payload(flightId=flight.id)).get_json()[
        "data"
    ]

    res = admin_client.patch(f"{base}/{created['id']}", json={"description": "Fare"})

    assert res.status_code == 200
    assert res.get_json()["data"]["flightId"] == flight.id


def test_expense_can_move_to_a_free_item_but_not_a_taken_one(
    admin_client, base, members, event, flight
):
    on_event = admin_client.post(base, json=payload(eventId=event.id)).get_json()[
        "data"
    ]
    on_flight = admin_client.post(base, json=payload(flightId=flight.id)).get_json()[
        "data"
    ]

    taken = admin_client.patch(f"{base}/{on_event['id']}", json={"flightId": flight.id})
    assert taken.status_code == 400

    moved = admin_client.patch(f"{base}/{on_flight['id']}", json={"flightId": None})
    assert moved.status_code == 200
    assert moved.get_json()["data"]["flightId"] is None
    moved_again = admin_client.patch(
        f"{base}/{on_event['id']}", json={"flightId": flight.id}
    )
    assert moved_again.status_code == 200
    data = moved_again.get_json()["data"]
    assert data["flightId"] == flight.id
    assert data["eventId"] is None


def test_viewer_cannot_create_but_can_read(viewer_client, base, members):
    assert viewer_client.post(base, json=payload()).status_code == 403
    assert viewer_client.get(base).status_code == 200
    assert viewer_client.get(f"{base}/balances").status_code == 200


def test_viewer_cannot_touch_settlements(viewer_client, base, members, admin_user):
    res = viewer_client.post(
        f"{base}/settlements",
        json={
            "fromUserId": admin_user.id,
            "toUserId": admin_user.id,
            "amountGbp": 5,
            "settledOn": "2026-08-02",
        },
    )
    assert res.status_code == 403


def test_non_member_denied(non_member_client, base, members):
    assert non_member_client.get(base).status_code in (401, 403, 404)
    assert non_member_client.post(base, json=payload()).status_code in (401, 403, 404)


def test_anonymous_denied(client, base, members):
    assert client.get(base).status_code == 401
    assert client.post(base, json=payload()).status_code == 401


def login_as(client, user_id):
    with client.session_transaction() as s:
        s["user_id"] = user_id


def test_editor_cannot_edit_or_delete_others(
    client, base, members, admin_user, editor_user
):
    login_as(client, admin_user.id)
    created = client.post(base, json=payload()).get_json()["data"]
    login_as(client, editor_user.id)
    assert (
        client.patch(f"{base}/{created['id']}", json={"description": "x"}).status_code
        == 403
    )
    assert client.delete(f"{base}/{created['id']}").status_code == 403


def test_editor_edits_own_expense(editor_client, base, members):
    created = editor_client.post(base, json=payload()).get_json()["data"]
    res = editor_client.patch(
        f"{base}/{created['id']}", json={"amount": 60, "description": "Big dinner"}
    )
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["amountGbp"] == 60
    assert [s["amountGbp"] for s in data["shares"]] == [20, 20, 20]


def test_admin_can_edit_and_delete_others(
    client, base, members, admin_user, editor_user
):
    login_as(client, editor_user.id)
    created = client.post(base, json=payload()).get_json()["data"]
    login_as(client, admin_user.id)
    assert (
        client.patch(f"{base}/{created['id']}", json={"description": "y"}).status_code
        == 200
    )
    assert client.delete(f"{base}/{created['id']}").status_code == 200
    assert client.get(base).get_json()["data"] == []


def test_balances_and_settlements(admin_client, base, members, admin_user, editor_user):
    admin_client.post(base, json=payload(amount=30))
    res = admin_client.get(f"{base}/balances").get_json()["data"]
    net = {b["userId"]: b["netGbp"] for b in res["balances"]}
    assert net[admin_user.id] == 20
    assert net[editor_user.id] == -10
    assert len(res["transfers"]) == 2
    assert res["totalSpentGbp"] == 30

    settle = admin_client.post(
        f"{base}/settlements",
        json={
            "fromUserId": editor_user.id,
            "toUserId": admin_user.id,
            "amountGbp": 10,
            "settledOn": "2026-08-02",
        },
    )
    assert settle.status_code == 201
    res = admin_client.get(f"{base}/balances").get_json()["data"]
    net = {b["userId"]: b["netGbp"] for b in res["balances"]}
    assert net[editor_user.id] == 0
    assert len(res["transfers"]) == 1

    listed = admin_client.get(f"{base}/settlements").get_json()["data"]
    assert len(listed) == 1
    sid = listed[0]["id"]
    assert (
        admin_client.patch(
            f"{base}/settlements/{sid}", json={"amountGbp": 5}
        ).status_code
        == 200
    )
    assert admin_client.delete(f"{base}/settlements/{sid}").status_code == 200


def test_settlement_same_person_rejected(admin_client, base, members, admin_user):
    res = admin_client.post(
        f"{base}/settlements",
        json={
            "fromUserId": admin_user.id,
            "toUserId": admin_user.id,
            "amountGbp": 5,
            "settledOn": "2026-08-02",
        },
    )
    assert res.status_code == 400


def payment(from_user, to_user, **kw):
    body = {
        "fromUserId": from_user.id,
        "toUserId": to_user.id,
        "amountGbp": 10,
        "settledOn": "2026-08-02",
    }
    body.update(kw)
    return body


def test_editor_cannot_set_someone_else_as_payer(
    editor_client, base, members, admin_user
):
    res = editor_client.post(base, json=payload(paidById=admin_user.id))
    assert res.status_code == 403


def test_editor_can_name_themselves_as_payer(editor_client, base, members, editor_user):
    res = editor_client.post(base, json=payload(paidById=editor_user.id))
    assert res.status_code == 201
    assert res.get_json()["data"]["paidById"] == editor_user.id


def test_admin_can_set_someone_else_as_payer(admin_client, base, members, editor_user):
    res = admin_client.post(base, json=payload(paidById=editor_user.id))
    assert res.status_code == 201
    assert res.get_json()["data"]["paidById"] == editor_user.id


def test_editor_cannot_change_payer_to_someone_else(
    editor_client, base, members, admin_user
):
    created = editor_client.post(base, json=payload()).get_json()["data"]
    res = editor_client.patch(
        f"{base}/{created['id']}", json={"paidById": admin_user.id}
    )
    assert res.status_code == 403


def test_editor_can_resave_an_expense_paid_by_someone_else(
    client, base, members, admin_user, editor_user
):
    """The edit form always sends the payer, so an unchanged payer must be accepted."""
    login_as(client, admin_user.id)
    created = client.post(base, json=payload(paidById=editor_user.id)).get_json()[
        "data"
    ]
    db.session.get(Expense, created["id"]).created_by_id = editor_user.id
    db.session.commit()
    login_as(client, editor_user.id)
    res = client.patch(
        f"{base}/{created['id']}",
        json={"paidById": editor_user.id, "description": "Lunch"},
    )
    assert res.status_code == 200


def test_editor_cannot_record_a_payment_from_someone_else(
    editor_client, base, members, admin_user, editor_user
):
    res = editor_client.post(
        f"{base}/settlements", json=payment(admin_user, editor_user)
    )
    assert res.status_code == 403


def test_editor_can_record_their_own_payment(
    editor_client, base, members, admin_user, editor_user
):
    res = editor_client.post(
        f"{base}/settlements", json=payment(editor_user, admin_user)
    )
    assert res.status_code == 201
    assert res.get_json()["data"]["fromUserId"] == editor_user.id


def test_admin_can_record_a_payment_between_other_members(
    admin_client, base, members, editor_user, viewer_user
):
    res = admin_client.post(
        f"{base}/settlements", json=payment(editor_user, viewer_user)
    )
    assert res.status_code == 201


def test_editor_cannot_change_a_payment_to_be_from_someone_else(
    editor_client, base, members, admin_user, editor_user
):
    created = editor_client.post(
        f"{base}/settlements", json=payment(editor_user, admin_user)
    ).get_json()["data"]
    res = editor_client.patch(
        f"{base}/settlements/{created['id']}", json={"fromUserId": admin_user.id}
    )
    assert res.status_code == 403

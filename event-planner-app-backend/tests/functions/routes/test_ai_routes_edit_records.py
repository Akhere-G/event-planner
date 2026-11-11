from datetime import date
from decimal import Decimal

from sqlalchemy import select
from src.extensions import db
from src.models import AiTask, Expense, Settlement, Wishlist
from tests.factories import ExpenseFactory, ItineraryFactory
from tests.functions.routes.test_ai_routes import accept, ask


def one_op(op, entity, data=None, item_id=None, reply="Done."):
    proposed = {"op": op, "entity": entity, "data": data or {}}
    if item_id is not None:
        proposed["id"] = item_id
    return {"reply": reply, "ops": [proposed]}


def stored_ops(response):
    task = db.session.get(AiTask, response.get_json()["data"]["task"]["id"])
    return task.result_ops


def test_an_admin_can_change_the_trips_dates_and_budget(admin_client, itinerary):
    reply = one_op(
        "update",
        "trip",
        {
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
            "budget_amount_gbp": 900,
        },
        itinerary.id,
    )

    response = ask(admin_client, itinerary, reply)

    assert response.status_code == 200
    assert stored_ops(response)[0]["data"] == {
        "start_date": "2026-09-01",
        "end_date": "2026-09-05",
        "budget_amount_gbp": 900.0,
    }
    db.session.refresh(itinerary)
    assert itinerary.start_date == date(2026, 8, 1)

    task_id = response.get_json()["data"]["task"]["id"]
    assert accept(admin_client, itinerary, task_id, [0]).status_code == 200
    db.session.refresh(itinerary)
    assert itinerary.start_date == date(2026, 9, 1)
    assert itinerary.end_date == date(2026, 9, 5)
    assert itinerary.budget_amount_gbp == 900


def test_an_editor_is_not_offered_the_trips_dates_and_budget(editor_client, itinerary):
    reply = one_op("update", "trip", {"budget_amount_gbp": 900}, itinerary.id)

    response = ask(editor_client, itinerary, reply)

    assert response.get_json()["data"]["task"] is None
    db.session.refresh(itinerary)
    assert itinerary.budget_amount_gbp != 900


def test_an_editor_cannot_apply_a_trip_change_stored_in_a_proposal(
    editor_client, itinerary, editor_user
):
    data = {"budget_amount_gbp": 900.0}
    ops = [{"op": "update", "entity": "trip", "id": itinerary.id, "data": data}]
    task = AiTask(
        itinerary_id=itinerary.id,
        type="edit_trip",
        status="ready",
        result_ops=ops,
        created_by_id=editor_user.id,
        updated_by_id=editor_user.id,
    )
    db.session.add(task)
    db.session.flush()

    response = accept(editor_client, itinerary, task.id, [0])

    assert response.status_code == 403
    db.session.refresh(itinerary)
    assert itinerary.budget_amount_gbp != 900


def test_a_wishlist_can_be_added_renamed_and_removed(
    editor_client, itinerary, wishlist
):
    add = ask(editor_client, itinerary, one_op("create", "wishlist", {"name": "Cafes"}))
    rename = ask(
        editor_client,
        itinerary,
        one_op("update", "wishlist", {"name": "Bars"}, wishlist.id),
    )

    accept(editor_client, itinerary, add.get_json()["data"]["task"]["id"], [0])
    accept(editor_client, itinerary, rename.get_json()["data"]["task"]["id"], [0])

    names = []
    for saved in db.session.scalars(
        select(Wishlist).where(Wishlist.itinerary_id == itinerary.id)
    ):
        names.append(saved.name)
    assert sorted(names) == ["Bars", "Cafes"]

    remove = ask(
        editor_client, itinerary, one_op("delete", "wishlist", None, wishlist.id)
    )
    accept(editor_client, itinerary, remove.get_json()["data"]["task"]["id"], [0])
    assert db.session.get(Wishlist, wishlist.id) is None


def test_a_wishlist_cannot_take_a_name_another_list_has(
    editor_client, itinerary, wishlist
):
    reply = one_op("create", "wishlist", {"name": wishlist.name})

    assert ask(editor_client, itinerary, reply).get_json()["data"]["task"] is None


def test_an_expense_is_added_and_split_between_the_people_chosen(
    editor_client, itinerary, editor_user, admin_user, admin_itinerary_user
):
    data = {
        "description": "Lunch",
        "amount": 20,
        "spent_on": "2026-08-02",
        "split_type": "selected",
        "participant_ids": [editor_user.id, admin_user.id],
    }

    response = ask(editor_client, itinerary, one_op("create", "expense", data))

    assert stored_ops(response)[0]["data"]["participant_ids"] == [
        editor_user.id,
        admin_user.id,
    ]
    task_id = response.get_json()["data"]["task"]["id"]
    assert accept(editor_client, itinerary, task_id, [0]).status_code == 200

    expense = db.session.scalars(
        select(Expense).where(Expense.itinerary_id == itinerary.id)
    ).one()
    assert expense.paid_by_id == editor_user.id
    shares = {}
    for share in expense.shares:
        shares[share.user_id] = share.amount_gbp
    assert shares == {editor_user.id: Decimal("10.00"), admin_user.id: Decimal("10.00")}


def test_an_expense_can_be_changed_and_removed(
    admin_client, itinerary, admin_user, editor_user, editor_itinerary_user
):
    expense = ExpenseFactory(itinerary=itinerary, paid_by=admin_user)
    change = {
        "amount": 60,
        "split_type": "selected",
        "participant_ids": [editor_user.id],
    }

    changed = ask(
        admin_client, itinerary, one_op("update", "expense", change, expense.id)
    )
    accept(admin_client, itinerary, changed.get_json()["data"]["task"]["id"], [0])

    db.session.refresh(expense)
    assert expense.amount_gbp == Decimal("60.00")
    assert len(expense.shares) == 1
    assert expense.shares[0].user_id == editor_user.id

    removed = ask(
        admin_client, itinerary, one_op("delete", "expense", None, expense.id)
    )
    accept(admin_client, itinerary, removed.get_json()["data"]["task"]["id"], [0])
    assert db.session.get(Expense, expense.id) is None


def test_an_editor_cannot_touch_an_expense_an_admin_added(
    editor_client, itinerary, admin_user, admin_itinerary_user
):
    expense = ExpenseFactory(itinerary=itinerary, paid_by=admin_user)

    response = ask(
        editor_client, itinerary, one_op("delete", "expense", None, expense.id)
    )

    assert response.get_json()["data"]["task"] is None
    assert db.session.get(Expense, expense.id) is not None


def test_an_editor_cannot_make_an_admin_the_payer(
    editor_client, itinerary, admin_user, admin_itinerary_user
):
    data = {
        "description": "Taxi",
        "amount": 12,
        "spent_on": "2026-08-02",
        "paid_by_id": admin_user.id,
    }

    response = ask(editor_client, itinerary, one_op("create", "expense", data))

    assert response.get_json()["data"]["task"] is None


def test_a_settlement_is_added_changed_and_removed(
    editor_client, itinerary, editor_user, admin_user, admin_itinerary_user
):
    data = {
        "from_user_id": editor_user.id,
        "to_user_id": admin_user.id,
        "amount_gbp": 15,
        "settled_on": "2026-08-03",
    }
    added = ask(editor_client, itinerary, one_op("create", "settlement", data))
    accept(editor_client, itinerary, added.get_json()["data"]["task"]["id"], [0])
    settlement = db.session.scalars(
        select(Settlement).where(Settlement.itinerary_id == itinerary.id)
    ).one()
    assert settlement.amount_gbp == Decimal("15.00")

    changed = ask(
        editor_client,
        itinerary,
        one_op("update", "settlement", {"amount_gbp": 5}, settlement.id),
    )
    accept(editor_client, itinerary, changed.get_json()["data"]["task"]["id"], [0])
    db.session.refresh(settlement)
    assert settlement.amount_gbp == Decimal("5.00")

    removed = ask(
        editor_client, itinerary, one_op("delete", "settlement", None, settlement.id)
    )
    accept(editor_client, itinerary, removed.get_json()["data"]["task"]["id"], [0])
    assert db.session.get(Settlement, settlement.id) is None


def test_an_anonymous_trip_is_not_offered_expenses(client):
    trip = ItineraryFactory(is_anonymous=True, anonymous_access_code="secret")
    headers = {"headers": {"X-Itinerary-Access-Code": "secret"}}
    data = {"description": "Taxi", "amount": 12, "spent_on": "2026-08-02"}

    response = ask(client, trip, one_op("create", "expense", data), **headers)

    assert response.status_code == 200
    assert response.get_json()["data"]["task"] is None

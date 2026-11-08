import importlib.util
from datetime import datetime
from decimal import Decimal
from pathlib import Path

import pytest
import sqlalchemy as sa

MIGRATION = (
    Path(__file__).parents[3]
    / "migrations/versions/a7b8c9d0e1f2_moved_flight_price_to_expenses.py"
)


@pytest.fixture(scope="module")
def migration():
    spec = importlib.util.spec_from_file_location("move_flight_price", MIGRATION)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def connection():
    """The schema as it is just before the migration, without app models."""
    engine = sa.create_engine("sqlite://")
    metadata = sa.MetaData()
    sa.Table(
        "airports",
        metadata,
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("code", sa.String),
        sa.Column("timezone", sa.String),
    )
    sa.Table(
        "flights",
        metadata,
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("itinerary_id", sa.Integer),
        sa.Column("airline", sa.String),
        sa.Column("flight_number", sa.String),
        sa.Column("departure_airport_id", sa.Integer),
        sa.Column("arrival_airport_id", sa.Integer),
        sa.Column("depart_at", sa.DateTime),
        sa.Column("price_gbp", sa.Integer),
        sa.Column("created_by_id", sa.Integer),
    )
    sa.Table(
        "expenses",
        metadata,
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("itinerary_id", sa.Integer),
        sa.Column("description", sa.String),
        sa.Column("category", sa.String),
        sa.Column("amount", sa.Numeric(12, 2)),
        sa.Column("currency", sa.String),
        sa.Column("amount_gbp", sa.Numeric(12, 2)),
        sa.Column("fx_rate", sa.Numeric(18, 8)),
        sa.Column("spent_on", sa.Date),
        sa.Column("paid_by_id", sa.Integer),
        sa.Column("flight_id", sa.Integer),
        sa.Column("split_type", sa.String),
        sa.Column("created_at", sa.DateTime),
        sa.Column("updated_at", sa.DateTime),
        sa.Column("created_by_id", sa.Integer),
        sa.Column("updated_by_id", sa.Integer),
    )
    sa.Table(
        "expense_shares",
        metadata,
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("expense_id", sa.Integer),
        sa.Column("user_id", sa.Integer),
        sa.Column("amount_gbp", sa.Numeric(12, 2)),
    )
    sa.Table(
        "itinerary_users",
        metadata,
        sa.Column("itinerary_id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, primary_key=True),
        sa.Column("role", sa.String),
    )
    metadata.create_all(engine)
    with engine.begin() as connection:
        connection.execute(
            sa.text(
                "INSERT INTO airports (id, code, timezone) VALUES "
                "(1, 'LHR', 'Europe/London'), (2, 'JFK', 'America/New_York'), "
                "(3, 'SYD', 'Australia/Sydney')"
            )
        )
        yield connection


def add_flight(connection, flight_id, price, created_by, **overrides):
    values = {
        "id": flight_id,
        "itinerary_id": 1,
        "airline": "BA",
        "flight_number": "117",
        "departure_airport_id": 1,
        "arrival_airport_id": 2,
        "depart_at": datetime(2026, 8, 1, 10),
        "price_gbp": price,
        "created_by_id": created_by,
        **overrides,
    }
    connection.execute(
        sa.text(
            "INSERT INTO flights VALUES (:id, :itinerary_id, :airline, :flight_number,"
            " :departure_airport_id, :arrival_airport_id, :depart_at, :price_gbp,"
            " :created_by_id)"
        ),
        values,
    )


def add_members(connection, *members):
    for user_id, role in members:
        connection.execute(
            sa.text("INSERT INTO itinerary_users VALUES (1, :user_id, :role)"),
            {"user_id": user_id, "role": role},
        )


def expense_rows(connection):
    return connection.execute(sa.text("SELECT * FROM expenses")).mappings().all()


def share_rows(connection):
    return {
        row.user_id: Decimal(str(row.amount_gbp))
        for row in connection.execute(sa.text("SELECT * FROM expense_shares"))
    }


def test_priced_flight_gets_an_expense_paid_by_its_creator(migration, connection):
    add_members(connection, (10, "admin"), (11, "editor"))
    add_flight(connection, 1, 520, created_by=11)

    assert migration.backfill_flight_expenses(connection) == 1

    [expense] = expense_rows(connection)
    assert expense["flight_id"] == 1
    assert expense["paid_by_id"] == 11
    assert expense["description"] == "BA117 · LHR → JFK"
    assert expense["category"] == "transport"
    assert Decimal(str(expense["amount_gbp"])) == Decimal("520")
    assert expense["currency"] == "GBP"
    assert share_rows(connection) == {10: Decimal("260"), 11: Decimal("260")}


def test_unpriced_flights_get_no_expense(migration, connection):
    add_members(connection, (10, "admin"))
    add_flight(connection, 1, None, created_by=10)

    assert migration.backfill_flight_expenses(connection) == 0
    assert expense_rows(connection) == []


def test_creator_who_left_the_trip_falls_back_to_the_first_admin(migration, connection):
    add_members(connection, (12, "editor"), (10, "admin"), (11, "admin"))
    add_flight(connection, 1, 90, created_by=99)

    migration.backfill_flight_expenses(connection)

    assert expense_rows(connection)[0]["paid_by_id"] == 10


def test_flight_with_no_one_to_pay_is_skipped(migration, connection):
    add_members(connection, (12, "editor"))
    add_flight(connection, 1, 90, created_by=None)

    assert migration.backfill_flight_expenses(connection) == 0


def test_remainder_pence_go_to_the_payer(migration, connection):
    add_members(connection, (10, "admin"), (11, "editor"), (12, "viewer"))
    add_flight(connection, 1, 100, created_by=11)

    migration.backfill_flight_expenses(connection)

    shares = share_rows(connection)
    assert shares == {10: Decimal("33.33"), 11: Decimal("33.34"), 12: Decimal("33.33")}
    assert sum(shares.values()) == Decimal("100")


def test_spent_on_is_the_departure_airports_local_date(migration, connection):
    add_members(connection, (10, "admin"))
    add_flight(
        connection,
        1,
        300,
        created_by=10,
        departure_airport_id=3,
        depart_at=datetime(2026, 8, 1, 20),
    )

    migration.backfill_flight_expenses(connection)

    assert str(expense_rows(connection)[0]["spent_on"]) == "2026-08-02"


def test_rerunning_does_not_duplicate_expenses(migration, connection):
    add_members(connection, (10, "admin"))
    add_flight(connection, 1, 90, created_by=10)

    migration.backfill_flight_expenses(connection)

    assert migration.backfill_flight_expenses(connection) == 0
    assert len(expense_rows(connection)) == 1


def test_restore_copies_expense_amounts_back_to_flights(migration, connection):
    add_members(connection, (10, "admin"))
    add_flight(connection, 1, 90, created_by=10)
    migration.backfill_flight_expenses(connection)
    connection.execute(sa.text("UPDATE flights SET price_gbp = NULL"))

    assert migration.restore_flight_prices(connection) == 1

    assert connection.execute(sa.text("SELECT price_gbp FROM flights")).scalar() == 90

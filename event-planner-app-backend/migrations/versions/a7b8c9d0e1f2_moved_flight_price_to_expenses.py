"""moved_flight_price_to_expenses

Expense is now the source of truth for what a flight costs. Each flight that
has a price gets an expense (split evenly between the trip's members), then
``flights.price_gbp`` is dropped.

Revision ID: a7b8c9d0e1f2
Revises: d1e2f3a4b5c6
Create Date: 2026-11-07 18:00:00.000000

"""

import logging
from datetime import UTC, datetime
from decimal import Decimal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "a7b8c9d0e1f2"
down_revision = "d1e2f3a4b5c6"
branch_labels = None
depends_on = None

logger = logging.getLogger("alembic.runtime.migration")

# Lightweight table definitions so the migration does not depend on app models.
flights = sa.table(
    "flights",
    sa.column("id", sa.Integer),
    sa.column("itinerary_id", sa.Integer),
    sa.column("airline", sa.String),
    sa.column("flight_number", sa.String),
    sa.column("departure_airport_id", sa.Integer),
    sa.column("arrival_airport_id", sa.Integer),
    sa.column("depart_at", sa.DateTime),
    sa.column("price_gbp", sa.Integer),
    sa.column("created_by_id", sa.Integer),
)
airports = sa.table(
    "airports",
    sa.column("id", sa.Integer),
    sa.column("code", sa.String),
    sa.column("timezone", sa.String),
)
expenses = sa.table(
    "expenses",
    sa.column("id", sa.Integer),
    sa.column("itinerary_id", sa.Integer),
    sa.column("description", sa.String),
    sa.column("category", sa.String),
    sa.column("amount", sa.Numeric),
    sa.column("currency", sa.String),
    sa.column("amount_gbp", sa.Numeric),
    sa.column("fx_rate", sa.Numeric),
    sa.column("spent_on", sa.Date),
    sa.column("paid_by_id", sa.Integer),
    sa.column("flight_id", sa.Integer),
    sa.column("split_type", sa.String),
    sa.column("created_at", sa.DateTime),
    sa.column("updated_at", sa.DateTime),
    sa.column("created_by_id", sa.Integer),
    sa.column("updated_by_id", sa.Integer),
)
expense_shares = sa.table(
    "expense_shares",
    sa.column("expense_id", sa.Integer),
    sa.column("user_id", sa.Integer),
    sa.column("amount_gbp", sa.Numeric),
)
itinerary_users = sa.table(
    "itinerary_users",
    sa.column("itinerary_id", sa.Integer),
    sa.column("user_id", sa.Integer),
    sa.column("role", sa.String),
)

CENT = Decimal("0.01")


def _local_date(departs_at: datetime, timezone_name: str | None):
    # Naive datetimes (MySQL) are always UTC.
    if departs_at.tzinfo is None:
        departs_at = departs_at.replace(tzinfo=UTC)
    try:
        zone = ZoneInfo(timezone_name) if timezone_name else UTC
    except ZoneInfoNotFoundError:
        zone = UTC
    return departs_at.astimezone(zone).date()


def _split_evenly(price: int, payer_id: int, member_ids: list[int]):
    """Whole-pence even split; the remainder goes to the payer (as compute_shares)."""
    base, remainder = divmod(price * 100, len(member_ids))
    shares = {user_id: Decimal(base) * CENT for user_id in member_ids}
    shares[payer_id] += Decimal(remainder) * CENT
    return shares


def _members_by_trip(connection):
    members: dict[int, list[tuple[int, str]]] = {}
    rows = connection.execute(
        sa.select(
            itinerary_users.c.itinerary_id,
            itinerary_users.c.user_id,
            itinerary_users.c.role,
        ).order_by(itinerary_users.c.itinerary_id, itinerary_users.c.user_id)
    )
    for itinerary_id, user_id, role in rows:
        members.setdefault(itinerary_id, []).append((user_id, role))
    return members


def _pick_payer(created_by_id, members: list[tuple[int, str]]):
    member_ids = [user_id for user_id, _ in members]
    if created_by_id in member_ids:
        return created_by_id
    return next((user_id for user_id, role in members if role == "admin"), None)


def backfill_flight_expenses(connection) -> int:
    """Create an expense for every priced flight that has none. Returns how many."""
    airport_info = {
        airport_id: (code, tz)
        for airport_id, code, tz in connection.execute(
            sa.select(airports.c.id, airports.c.code, airports.c.timezone)
        )
    }
    members = _members_by_trip(connection)

    unlinked = ~sa.exists().where(expenses.c.flight_id == flights.c.id)
    rows = connection.execute(
        sa.select(flights).where(flights.c.price_gbp.is_not(None), unlinked)
    ).mappings()

    created = 0
    now = datetime.now(UTC).replace(tzinfo=None)
    for flight in rows.all():
        trip_members = members.get(flight["itinerary_id"], [])
        payer_id = _pick_payer(flight["created_by_id"], trip_members)
        if payer_id is None:
            logger.warning(
                "Skipping price of flight %s: its trip has no member to pay.",
                flight["id"],
            )
            continue

        departure_code, departure_tz = airport_info.get(
            flight["departure_airport_id"], ("???", None)
        )
        arrival_code, _ = airport_info.get(flight["arrival_airport_id"], ("???", None))
        price = Decimal(flight["price_gbp"]).quantize(CENT)

        result = connection.execute(
            sa.insert(expenses).values(
                itinerary_id=flight["itinerary_id"],
                description=(
                    f"{flight['airline']}{flight['flight_number']} · "
                    f"{departure_code} → {arrival_code}"
                ),
                category="transport",
                amount=price,
                currency="GBP",
                amount_gbp=price,
                fx_rate=Decimal("1"),
                spent_on=_local_date(flight["depart_at"], departure_tz),
                paid_by_id=payer_id,
                flight_id=flight["id"],
                split_type="even_all",
                created_at=now,
                updated_at=now,
                created_by_id=flight["created_by_id"],
                updated_by_id=flight["created_by_id"],
            )
        )
        expense_id = result.lastrowid
        shares = _split_evenly(
            flight["price_gbp"], payer_id, [user_id for user_id, _ in trip_members]
        )
        connection.execute(
            sa.insert(expense_shares),
            [
                {"expense_id": expense_id, "user_id": user_id, "amount_gbp": amount}
                for user_id, amount in shares.items()
            ],
        )
        created += 1
    return created


def restore_flight_prices(connection) -> int:
    """Copy each flight expense's amount back onto its flight, in whole pounds."""
    rows = connection.execute(
        sa.select(expenses.c.flight_id, expenses.c.amount_gbp).where(
            expenses.c.flight_id.is_not(None)
        )
    ).all()
    for flight_id, amount_gbp in rows:
        connection.execute(
            sa.update(flights)
            .where(flights.c.id == flight_id)
            .values(price_gbp=int(Decimal(amount_gbp).to_integral_value()))
        )
    return len(rows)


def upgrade():
    backfill_flight_expenses(op.get_bind())
    with op.batch_alter_table("flights", schema=None) as batch_op:
        batch_op.drop_column("price_gbp")


def downgrade():
    with op.batch_alter_table("flights", schema=None) as batch_op:
        batch_op.add_column(sa.Column("price_gbp", sa.Integer(), nullable=True))
    restore_flight_prices(op.get_bind())

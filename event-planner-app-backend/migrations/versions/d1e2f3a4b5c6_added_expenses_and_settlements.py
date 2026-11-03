"""added_expenses_and_settlements

Revision ID: d1e2f3a4b5c6
Revises: f1e2d3c4b5a6
Create Date: 2026-11-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d1e2f3a4b5c6"
down_revision = "f1e2d3c4b5a6"
branch_labels = None
depends_on = None


def _audit_columns():
    return [
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
    ]


def upgrade():
    op.create_table(
        "expenses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("amount_gbp", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("fx_rate", sa.Numeric(precision=18, scale=8), nullable=False),
        sa.Column("spent_on", sa.Date(), nullable=False),
        sa.Column("paid_by_id", sa.Integer(), nullable=False),
        sa.Column("event_id", sa.Integer(), nullable=True),
        sa.Column("accommodation_id", sa.Integer(), nullable=True),
        sa.Column("split_type", sa.String(length=16), nullable=False),
        *_audit_columns(),
        sa.ForeignKeyConstraint(["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["paid_by_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["accommodation_id"], ["accommodations.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_expenses_itinerary_id", "expenses", ["itinerary_id"])
    op.create_index("ix_expenses_spent_on", "expenses", ["spent_on"])
    op.create_index("ix_expenses_paid_by_id", "expenses", ["paid_by_id"])
    op.create_index("ix_expenses_event_id", "expenses", ["event_id"])
    op.create_index("ix_expenses_accommodation_id", "expenses", ["accommodation_id"])

    op.create_table(
        "expense_shares",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("expense_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("amount_gbp", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.ForeignKeyConstraint(["expense_id"], ["expenses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_expense_shares_expense_id", "expense_shares", ["expense_id"])
    op.create_index("ix_expense_shares_user_id", "expense_shares", ["user_id"])

    op.create_table(
        "settlements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column("from_user_id", sa.Integer(), nullable=False),
        sa.Column("to_user_id", sa.Integer(), nullable=False),
        sa.Column("amount_gbp", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("settled_on", sa.Date(), nullable=False),
        *_audit_columns(),
        sa.ForeignKeyConstraint(["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["from_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["to_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_settlements_itinerary_id", "settlements", ["itinerary_id"])
    op.create_index("ix_settlements_from_user_id", "settlements", ["from_user_id"])
    op.create_index("ix_settlements_to_user_id", "settlements", ["to_user_id"])


def downgrade():
    op.drop_table("settlements")
    op.drop_table("expense_shares")
    op.drop_table("expenses")

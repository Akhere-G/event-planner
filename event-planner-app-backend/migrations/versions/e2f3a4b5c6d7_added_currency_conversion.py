"""added_currency_conversion

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-11-02 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e2f3a4b5c6d7"
down_revision = "d1e2f3a4b5c6"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "exchange_rates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("base", sa.String(length=3), nullable=False),
        sa.Column("quote", sa.String(length=3), nullable=False),
        sa.Column("rate", sa.Numeric(precision=18, scale=8), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("date", "base", "quote", name="uq_exchange_rate"),
    )
    op.create_index(
        op.f("ix_exchange_rates_date"), "exchange_rates", ["date"], unique=False
    )
    op.add_column(
        "users",
        sa.Column(
            "home_currency",
            sa.String(length=3),
            nullable=False,
            server_default="GBP",
        ),
    )


def downgrade():
    op.drop_column("users", "home_currency")
    op.drop_index(op.f("ix_exchange_rates_date"), table_name="exchange_rates")
    op.drop_table("exchange_rates")

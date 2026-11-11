"""added_exchange_rates

Revision ID: e2f3a4b5c6d7
Revises: b4c5d6e7f8a9
Create Date: 2026-11-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e2f3a4b5c6d7"
down_revision = "b4c5d6e7f8a9"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "exchange_rates",
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("base", sa.String(length=3), nullable=False),
        sa.Column("quote", sa.String(length=3), nullable=False),
        sa.Column("rate", sa.Numeric(precision=18, scale=8), nullable=False),
        sa.PrimaryKeyConstraint("date", "base", "quote"),
    )


def downgrade():
    op.drop_table("exchange_rates")

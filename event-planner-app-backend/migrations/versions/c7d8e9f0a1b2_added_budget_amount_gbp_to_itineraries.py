"""added_budget_amount_gbp_to_itineraries

Revision ID: c7d8e9f0a1b2
Revises: 5d67e955186a
Create Date: 2026-11-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c7d8e9f0a1b2"
down_revision = "5d67e955186a"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("itineraries", schema=None, recreate="never") as batch_op:
        batch_op.add_column(
            sa.Column(
                "budget_amount_gbp",
                sa.Numeric(precision=12, scale=2),
                nullable=True,
            )
        )


def downgrade():
    with op.batch_alter_table("itineraries", schema=None) as batch_op:
        batch_op.drop_column("budget_amount_gbp")

"""added_cost_estimates_to_events_accommodations_wishlist_items

Revision ID: d8e9f0a1b2c3
Revises: c7d8e9f0a1b2
Create Date: 2026-11-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d8e9f0a1b2c3"
down_revision = "c7d8e9f0a1b2"
branch_labels = None
depends_on = None

TABLES = ("events", "accommodations", "wishlist_items")


def upgrade():
    for table in TABLES:
        with op.batch_alter_table(table, schema=None, recreate="never") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "estimated_cost_gbp",
                    sa.Numeric(precision=12, scale=2),
                    nullable=True,
                )
            )
            batch_op.add_column(
                sa.Column("price_tier", sa.SmallInteger(), nullable=True)
            )


def downgrade():
    for table in TABLES:
        with op.batch_alter_table(table, schema=None) as batch_op:
            batch_op.drop_column("price_tier")
            batch_op.drop_column("estimated_cost_gbp")

"""added_reminder_sent_at_to_events

Revision ID: a1b2c3d4e5f6
Revises: 9a1f3c2d7e4b
Create Date: 2026-10-22 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "9a1f3c2d7e4b"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("events", schema=None, recreate="never") as batch_op:
        batch_op.add_column(
            sa.Column(
                "reminder_sent_at",
                sa.DateTime(timezone=True),
                nullable=True,
            )
        )


def downgrade():
    with op.batch_alter_table("events", schema=None) as batch_op:
        batch_op.drop_column("reminder_sent_at")

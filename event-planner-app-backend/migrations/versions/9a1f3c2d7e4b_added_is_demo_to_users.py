"""added_is_demo_to_users

Revision ID: 9a1f3c2d7e4b
Revises: 5b85d7a702a4
Create Date: 2026-10-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9a1f3c2d7e4b"
down_revision = "5b85d7a702a4"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users", schema=None, recreate="never") as batch_op:
        batch_op.add_column(
            sa.Column(
                "is_demo",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            )
        )


def downgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("is_demo")

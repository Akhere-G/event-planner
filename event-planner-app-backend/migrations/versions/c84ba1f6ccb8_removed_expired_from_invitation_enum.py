"""removed expired from invitation enum

Revision ID: c84ba1f6ccb8
Revises: c85c78a2b003
Create Date: 2026-04-08 15:06:40.836271

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c84ba1f6ccb8"
down_revision = "c85c78a2b003"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("itinerary_invitations", schema=None) as batch_op:
        batch_op.alter_column(
            "status",
            existing_type=sa.Enum(
                "PENDING",
                "ACCEPTED",
                "DECLINED",
                "REVOKED",
                "EXPIRED",
                name="invitationstatus",
            ),
            type_=sa.Enum(
                "pending", "accepted", "declined", "revoked", name="invitationstatus"
            ),
            existing_nullable=False,
        )


def downgrade():
    with op.batch_alter_table("itinerary_invitations", schema=None) as batch_op:
        batch_op.alter_column(
            "status",
            existing_type=sa.Enum(
                "pending", "accepted", "declined", "revoked", name="invitationstatus"
            ),
            type_=sa.Enum(
                "PENDING",
                "ACCEPTED",
                "DECLINED",
                "REVOKED",
                "EXPIRED",
                name="invitationstatus",
            ),
            existing_nullable=False,
        )

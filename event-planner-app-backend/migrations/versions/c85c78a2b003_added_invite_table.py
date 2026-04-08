"""added invite table

Revision ID: c85c78a2b003
Revises: 1775574377
Create Date: 2026-04-08 11:09:07.646891

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c85c78a2b003"
down_revision = "1775574377"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "itinerary_invitations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("inviter_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("token", sa.String(length=100), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["inviter_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token"),
    )


def downgrade():
    op.drop_table("itinerary_invitations")

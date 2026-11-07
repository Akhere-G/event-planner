"""added_trip_preferences

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


def upgrade():
    op.create_table(
        "trip_preferences",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column(
            "trip_type",
            sa.Enum("solo", "couple", "friends", "family", name="triptype"),
            nullable=True,
        ),
        sa.Column("group_size", sa.Integer(), nullable=True),
        sa.Column("vibes", sa.JSON(), nullable=False),
        sa.Column(
            "budget_tier",
            sa.Enum("budget", "mid", "luxury", name="budgettier"),
            nullable=True,
        ),
        sa.Column(
            "pace",
            sa.Enum("relaxed", "balanced", "packed", name="trippace"),
            nullable=True,
        ),
        sa.Column("interests", sa.JSON(), nullable=False),
        sa.Column("transport", sa.String(length=32), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("trip_preferences", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_trip_preferences_itinerary_id"),
            ["itinerary_id"],
            unique=True,
        )


def downgrade():
    with op.batch_alter_table("trip_preferences", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_trip_preferences_itinerary_id"))
    op.drop_table("trip_preferences")

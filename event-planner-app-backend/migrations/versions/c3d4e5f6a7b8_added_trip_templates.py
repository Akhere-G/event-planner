"""added_trip_templates

Revision ID: c3d4e5f6a7b8
Revises: e2f3a4b5c6d7
Create Date: 2026-11-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c3d4e5f6a7b8"
down_revision = "e2f3a4b5c6d7"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "trip_templates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("destination", sa.String(length=255), nullable=False),
        sa.Column("region", sa.String(length=32), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=True),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("cover_image", sa.String(length=255), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("clone_count", sa.Integer(), nullable=False),
        sa.Column("ops", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.UniqueConstraint("itinerary_id"),
    )
    op.create_index("ix_trip_templates_author_id", "trip_templates", ["author_id"])
    op.create_index("ix_trip_templates_destination", "trip_templates", ["destination"])
    op.create_index("ix_trip_templates_region", "trip_templates", ["region"])
    op.create_index("ix_trip_templates_is_public", "trip_templates", ["is_public"])


def downgrade():
    op.drop_index("ix_trip_templates_is_public", table_name="trip_templates")
    op.drop_index("ix_trip_templates_region", table_name="trip_templates")
    op.drop_index("ix_trip_templates_destination", table_name="trip_templates")
    op.drop_index("ix_trip_templates_author_id", table_name="trip_templates")
    op.drop_table("trip_templates")

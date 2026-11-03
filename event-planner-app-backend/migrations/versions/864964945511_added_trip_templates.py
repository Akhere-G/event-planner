"""added_trip_templates

Revision ID: 864964945511
Revises: 04bf52d2d617
Create Date: 2026-11-02 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "864964945511"
down_revision = "04bf52d2d617"
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
        sa.Column("destination", sa.String(length=255), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=True),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("clone_count", sa.Integer(), nullable=False),
        sa.Column("ops", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("itinerary_id", name="uq_trip_templates_itinerary_id"),
    )
    with op.batch_alter_table("trip_templates", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_trip_templates_slug"), ["slug"], unique=True
        )
        batch_op.create_index(
            batch_op.f("ix_trip_templates_author_id"), ["author_id"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_trip_templates_destination"), ["destination"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_trip_templates_is_public"), ["is_public"], unique=False
        )


def downgrade():
    with op.batch_alter_table("trip_templates", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_trip_templates_is_public"))
        batch_op.drop_index(batch_op.f("ix_trip_templates_destination"))
        batch_op.drop_index(batch_op.f("ix_trip_templates_author_id"))
        batch_op.drop_index(batch_op.f("ix_trip_templates_slug"))

    op.drop_table("trip_templates")

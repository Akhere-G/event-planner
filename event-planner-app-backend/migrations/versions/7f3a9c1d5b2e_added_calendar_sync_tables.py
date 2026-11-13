"""added_calendar_sync_tables

Revision ID: 7f3a9c1d5b2e
Revises: c3d4e5f6a7b8
Create Date: 2026-11-12 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7f3a9c1d5b2e"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "calendar_connections",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("encrypted_refresh_token", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.create_table(
        "trip_calendars",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column("google_calendar_id", sa.String(length=255), nullable=False),
        sa.Column("sync_token", sa.Text(), nullable=True),
        sa.Column("channel_id", sa.String(length=64), nullable=True),
        sa.Column("channel_token", sa.String(length=64), nullable=True),
        sa.Column("channel_resource_id", sa.String(length=255), nullable=True),
        sa.Column("channel_expires_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("channel_id"),
        sa.UniqueConstraint("user_id", "itinerary_id"),
    )
    op.create_index("ix_trip_calendars_user_id", "trip_calendars", ["user_id"])
    op.create_index(
        "ix_trip_calendars_itinerary_id", "trip_calendars", ["itinerary_id"]
    )
    op.create_index(
        "ix_trip_calendars_channel_expires_at",
        "trip_calendars",
        ["channel_expires_at"],
    )
    op.create_table(
        "calendar_links",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("trip_calendar_id", sa.Integer(), nullable=False),
        sa.Column("entity", sa.String(length=32), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("google_event_id", sa.String(length=255), nullable=False),
        sa.Column("etag", sa.String(length=255), nullable=False),
        sa.Column("synced_updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["trip_calendar_id"], ["trip_calendars.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("trip_calendar_id", "entity", "entity_id"),
        sa.UniqueConstraint("trip_calendar_id", "google_event_id"),
    )
    op.create_index(
        "ix_calendar_links_trip_calendar_id", "calendar_links", ["trip_calendar_id"]
    )


def downgrade():
    op.drop_table("calendar_links")
    op.drop_table("trip_calendars")
    op.drop_table("calendar_connections")

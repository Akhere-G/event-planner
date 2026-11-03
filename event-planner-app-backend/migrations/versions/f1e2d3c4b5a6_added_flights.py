"""added_flights

Revision ID: f1e2d3c4b5a6
Revises: c7d8e9f0a1b2
Create Date: 2026-11-02 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f1e2d3c4b5a6"
down_revision = "c7d8e9f0a1b2"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "flights",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column("airline", sa.String(length=255), nullable=False),
        sa.Column("flight_number", sa.String(length=16), nullable=False),
        sa.Column("departure_airport", sa.String(length=3), nullable=False),
        sa.Column("arrival_airport", sa.String(length=3), nullable=False),
        sa.Column("departure_timezone", sa.String(length=64), nullable=False),
        sa.Column("arrival_timezone", sa.String(length=64), nullable=False),
        sa.Column("depart_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("arrive_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("booking_ref", sa.String(length=32), nullable=True),
        sa.Column("seat", sa.String(length=16), nullable=True),
        sa.Column("notes", sa.String(length=1000), nullable=True),
        sa.Column("travellers", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=True),
        sa.Column("status_updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("terminal", sa.String(length=16), nullable=True),
        sa.Column("gate", sa.String(length=16), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["created_by_id"], ["users.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["updated_by_id"], ["users.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("flights", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_flights_itinerary_id"), ["itinerary_id"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_flights_depart_at"), ["depart_at"], unique=False
        )


def downgrade():
    with op.batch_alter_table("flights", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_flights_depart_at"))
        batch_op.drop_index(batch_op.f("ix_flights_itinerary_id"))
    op.drop_table("flights")

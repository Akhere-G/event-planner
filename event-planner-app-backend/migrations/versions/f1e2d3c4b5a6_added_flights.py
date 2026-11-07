"""add simplified flights

Revision ID: f1e2d3c4b5a6
Revises: d8e9f0a1b2c3
Create Date: 2026-11-07 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f1e2d3c4b5a6"
down_revision = "d8e9f0a1b2c3"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "airports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=3), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("timezone", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("airports", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_airports_code"), ["code"], unique=True)
    op.create_table(
        "flights",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column("airline", sa.String(length=3), nullable=False),
        sa.Column("flight_number", sa.String(length=5), nullable=False),
        sa.Column("departure_airport_id", sa.Integer(), nullable=False),
        sa.Column("arrival_airport_id", sa.Integer(), nullable=False),
        sa.Column("depart_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("arrive_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["departure_airport_id"], ["airports.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["arrival_airport_id"], ["airports.id"], ondelete="RESTRICT"
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
        batch_op.create_index(
            batch_op.f("ix_flights_departure_airport_id"),
            ["departure_airport_id"],
            unique=False,
        )
        batch_op.create_index(
            batch_op.f("ix_flights_arrival_airport_id"),
            ["arrival_airport_id"],
            unique=False,
        )


def downgrade():
    op.drop_table("flights")
    with op.batch_alter_table("airports", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_airports_code"))
    op.drop_table("airports")

"""simplified_event_itinerary_relationship

Revision ID: ad858cfe0b71
Revises: 99565612f051
Create Date: 2026-08-21 13:29:45.855191
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "ad858cfe0b71"
down_revision = "99565612f051"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("events", schema=None) as batch_op:
        batch_op.add_column(sa.Column("itinerary_id", sa.Integer(), nullable=True))

    op.execute(
        """
        UPDATE events
        SET itinerary_id = (
            SELECT ie.itinerary_id
            FROM itinerary_events ie
            WHERE ie.event_id = events.id
            ORDER BY ie.created_at ASC
            LIMIT 1
        )
        """
    )

    conn = op.get_bind()
    orphaned = conn.execute(
        sa.text("SELECT COUNT(*) FROM events WHERE itinerary_id IS NULL")
    ).scalar()
    if orphaned:
        raise RuntimeError(
            f"{orphaned} event(s) have no associated itinerary and would "
            "violate the new NOT NULL constraint. Resolve before "
            "re-running this migration."
        )

    with op.batch_alter_table("events", schema=None) as batch_op:
        batch_op.alter_column("itinerary_id", nullable=False)
        batch_op.create_index(
            batch_op.f("ix_events_itinerary_id"), ["itinerary_id"], unique=False
        )
        batch_op.create_foreign_key(
            "fk_events_itinerary_id",
            "itineraries",
            ["itinerary_id"],
            ["id"],
            ondelete="CASCADE",
        )

    op.drop_table("itinerary_events")


def downgrade():
    op.create_table(
        "itinerary_events",
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column("event_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("itinerary_id", "event_id"),
    )

    op.execute(
        """
        INSERT INTO itinerary_events
            (itinerary_id, event_id, created_by_id, updated_by_id)
        SELECT itinerary_id, id, created_by_id, updated_by_id
        FROM events
        """
    )

    with op.batch_alter_table("events", schema=None) as batch_op:
        batch_op.drop_constraint("fk_events_itinerary_id", type_="foreignkey")
        batch_op.drop_index(batch_op.f("ix_events_itinerary_id"))
        batch_op.drop_column("itinerary_id")

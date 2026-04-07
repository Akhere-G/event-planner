"""made all enums lowercase

Revision ID: 1775574377
Revises: 1775478475
Create Date: 2026-04-07 16:06:17.796792

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1775574377"
down_revision: Union[str, Sequence[str], None] = "1775478475"
branch_labels: Union[str, Sequence[str], None] = ()
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        "UPDATE events SET event_status = LOWER(event_status), event_source = LOWER(event_source)"
    )

    op.execute("UPDATE itinerary_users SET role = LOWER(role)")

    with op.batch_alter_table("events", schema=None) as batch_op:
        batch_op.alter_column(
            "event_status",
            existing_type=sa.Enum(
                "ACTIVE", "CANCELLED", "POSTPONED", name="eventstatus"
            ),
            type_=sa.Enum("active", "cancelled", "postponed", name="eventstatus"),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "event_source",
            existing_type=sa.Enum("CUSTOM", name="eventsource"),
            type_=sa.Enum("custom", name="eventsource"),
            existing_nullable=False,
        )

    with op.batch_alter_table("itinerary_users", schema=None) as batch_op:
        batch_op.alter_column(
            "role",
            existing_type=sa.Enum("ADMIN", "EDITOR", "VIEWER", name="userrole"),
            type_=sa.Enum("admin", "editor", "viewer", name="userrole"),
        )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        "UPDATE events SET event_status = UPPER(event_status), event_source = UPPER(event_source)"
    )
    op.execute("UPDATE itinerary_users SET role = UPPER(role)")

    with op.batch_alter_table("events", schema=None) as batch_op:
        batch_op.alter_column(
            "event_status",
            existing_type=sa.Enum(
                "active", "cancelled", "postponed", name="eventstatus"
            ),
            type_=sa.Enum("ACTIVE", "CANCELLED", "POSTPONED", name="eventstatus"),
        )
        batch_op.alter_column(
            "event_source",
            existing_type=sa.Enum("custom", name="eventsource"),
            type_=sa.Enum("CUSTOM", name="eventsource"),
        )

    with op.batch_alter_table("itinerary_users", schema=None) as batch_op:
        batch_op.alter_column(
            "role",
            existing_type=sa.Enum("admin", "editor", "viewer", name="userrole"),
            type_=sa.Enum("ADMIN", "EDITOR", "VIEWER", name="userrole"),
        )

"""added_missing_fk_indexes

Revision ID: b2c3d4e5f6a7
Revises: 9a1f3c2d7e4b
Create Date: 2026-10-22 00:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "b2c3d4e5f6a7"
down_revision = "9a1f3c2d7e4b"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table(
        "itinerary_invitations", schema=None, recreate="never"
    ) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_itinerary_invitations_itinerary_id"),
            ["itinerary_id"],
            unique=False,
        )

    with op.batch_alter_table(
        "packing_items", schema=None, recreate="never"
    ) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_packing_items_checked_by_id"),
            ["checked_by_id"],
            unique=False,
        )


def downgrade():
    with op.batch_alter_table("packing_items", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_packing_items_checked_by_id"))

    with op.batch_alter_table("itinerary_invitations", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_itinerary_invitations_itinerary_id"))

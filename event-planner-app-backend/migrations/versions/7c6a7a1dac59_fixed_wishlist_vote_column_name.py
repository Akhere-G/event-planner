"""fixed_wishlist_vote_column_name

Revision ID: 7c6a7a1dac59
Revises: ad858cfe0b71
Create Date: 2026-08-21 14:12:18.005879
"""

from alembic import op
import sqlalchemy as sa


revision = "7c6a7a1dac59"
down_revision = "ad858cfe0b71"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("wishlist_item_votes", schema=None) as batch_op:
        batch_op.add_column(sa.Column("is_thumbs_up", sa.Boolean(), nullable=True))

    op.execute(
        """
        UPDATE wishlist_item_votes
        SET is_thumbs_up = isThumbsUp;
        """
    )

    with op.batch_alter_table("wishlist_item_votes", schema=None) as batch_op:
        batch_op.alter_column(
            "is_thumbs_up",
            existing_type=sa.Boolean(),
            nullable=False,
        )
        batch_op.drop_column("isThumbsUp")


def downgrade():
    with op.batch_alter_table("wishlist_item_votes", schema=None) as batch_op:
        batch_op.add_column(sa.Column("isThumbsUp", sa.Boolean(), nullable=True))

    op.execute(
        """
        UPDATE wishlist_item_votes
        SET isThumbsUp = is_thumbs_up;
        """
    )

    with op.batch_alter_table("wishlist_item_votes", schema=None) as batch_op:
        batch_op.alter_column(
            "isThumbsUp",
            existing_type=sa.Boolean(),
            nullable=False,
        )
        batch_op.drop_column("is_thumbs_up")

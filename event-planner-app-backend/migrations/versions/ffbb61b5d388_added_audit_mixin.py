"""added_audit_mixin

Revision ID: ffbb61b5d388
Revises: 6b68d2fc96ee
Create Date: 2026-07-06 12:05:27.465832

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "ffbb61b5d388"
down_revision = "6b68d2fc96ee"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("wishlist_categories", schema=None) as batch_op:
        batch_op.add_column(sa.Column("created_at", sa.DateTime(), nullable=False))
        batch_op.add_column(sa.Column("updated_at", sa.DateTime(), nullable=False))
        batch_op.add_column(sa.Column("created_by_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("updated_by_id", sa.Integer(), nullable=True))

        batch_op.drop_constraint(
            batch_op.f("uq_itinerary_category_name"),
            type_="unique",
        )

        batch_op.create_unique_constraint(
            "uq_itinerary_wishlist_name",
            ["itinerary_id", "name"],
        )

        batch_op.create_foreign_key(
            "fk_wishlist_categories_created_by_id_users",
            "users",
            ["created_by_id"],
            ["id"],
        )

        batch_op.create_foreign_key(
            "fk_wishlist_categories_updated_by_id_users",
            "users",
            ["updated_by_id"],
            ["id"],
        )

    with op.batch_alter_table("wishlist_items", schema=None) as batch_op:
        batch_op.add_column(sa.Column("wishlist_id", sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column("updated_at", sa.DateTime(), nullable=False))
        batch_op.add_column(sa.Column("updated_by_id", sa.Integer(), nullable=True))

        batch_op.alter_column(
            "created_by_id",
            existing_type=sa.INTEGER(),
            nullable=True,
        )

        batch_op.drop_index(batch_op.f("ix_wishlist_items_category_id"))

        batch_op.create_index(
            batch_op.f("ix_wishlist_items_wishlist_id"),
            ["wishlist_id"],
            unique=False,
        )

        batch_op.create_foreign_key(
            "fk_wishlist_items_updated_by_id_users",
            "users",
            ["updated_by_id"],
            ["id"],
        )

        batch_op.create_foreign_key(
            "fk_wishlist_items_wishlist_id_wishlist_categories",
            "wishlist_categories",
            ["wishlist_id"],
            ["id"],
            ondelete="CASCADE",
        )

        batch_op.drop_column("category_id")


def downgrade():
    with op.batch_alter_table("wishlist_items", schema=None) as batch_op:
        batch_op.add_column(sa.Column("category_id", sa.INTEGER(), nullable=False))

        batch_op.drop_constraint(
            "fk_wishlist_items_wishlist_id_wishlist_categories",
            type_="foreignkey",
        )

        batch_op.drop_constraint(
            "fk_wishlist_items_updated_by_id_users",
            type_="foreignkey",
        )

        batch_op.create_foreign_key(
            None,
            "wishlist_categories",
            ["category_id"],
            ["id"],
            ondelete="CASCADE",
        )

        batch_op.drop_index(batch_op.f("ix_wishlist_items_wishlist_id"))

        batch_op.create_index(
            batch_op.f("ix_wishlist_items_category_id"),
            ["category_id"],
            unique=False,
        )

        batch_op.alter_column(
            "created_by_id",
            existing_type=sa.INTEGER(),
            nullable=False,
        )

        batch_op.drop_column("updated_by_id")
        batch_op.drop_column("updated_at")
        batch_op.drop_column("wishlist_id")

    with op.batch_alter_table("wishlist_categories", schema=None) as batch_op:
        batch_op.drop_constraint(
            "fk_wishlist_categories_updated_by_id_users",
            type_="foreignkey",
        )

        batch_op.drop_constraint(
            "fk_wishlist_categories_created_by_id_users",
            type_="foreignkey",
        )

        batch_op.drop_constraint(
            "uq_itinerary_wishlist_name",
            type_="unique",
        )

        batch_op.create_unique_constraint(
            batch_op.f("uq_itinerary_category_name"),
            ["itinerary_id", "name"],
        )

        batch_op.drop_column("updated_by_id")
        batch_op.drop_column("created_by_id")
        batch_op.drop_column("updated_at")
        batch_op.drop_column("created_at")

"""add_notifications

Revision ID: e8d90f12a3b4
Revises: 7c6a7a1dac59
Create Date: 2026-08-30 13:20:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e8d90f12a3b4"
down_revision = "7c6a7a1dac59"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("link_url", sa.String(length=500), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("notifications", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_notifications_user_id"), ["user_id"], unique=False
        )

    op.create_table(
        "notification_subscriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("endpoint", sa.String(length=500), nullable=False),
        sa.Column("p256dh", sa.String(length=255), nullable=False),
        sa.Column("auth", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("notification_subscriptions", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_notification_subscriptions_user_id"),
            ["user_id"],
            unique=False,
        )
        batch_op.create_index(
            batch_op.f("ix_notification_subscriptions_endpoint"),
            ["endpoint"],
            unique=True,
        )


def downgrade():
    with op.batch_alter_table("notification_subscriptions", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_notification_subscriptions_endpoint"))
        batch_op.drop_index(batch_op.f("ix_notification_subscriptions_user_id"))

    op.drop_table("notification_subscriptions")

    with op.batch_alter_table("notifications", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_notifications_user_id"))

    op.drop_table("notifications")

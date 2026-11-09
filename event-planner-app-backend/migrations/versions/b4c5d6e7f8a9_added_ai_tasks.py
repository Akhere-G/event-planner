"""added_ai_tasks

Revision ID: b4c5d6e7f8a9
Revises: a7b8c9d0e1f2
Create Date: 2026-11-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "b4c5d6e7f8a9"
down_revision = "a7b8c9d0e1f2"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "ai_tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("itinerary_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("params", sa.JSON(), nullable=False),
        sa.Column("result_ops", sa.JSON(), nullable=True),
        sa.Column("applied_counts", sa.JSON(), nullable=True),
        sa.Column("progress_text", sa.String(length=255), nullable=True),
        sa.Column("progress_current", sa.Integer(), nullable=True),
        sa.Column("progress_total", sa.Integer(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("max_attempts", sa.Integer(), nullable=False),
        sa.Column("heartbeat_at", sa.DateTime(), nullable=True),
        sa.Column("cloud_task_name", sa.String(length=255), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("decided_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["itinerary_id"], ["itineraries.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("ai_tasks", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_ai_tasks_itinerary_id"), ["itinerary_id"], unique=False
        )
        batch_op.create_index(batch_op.f("ix_ai_tasks_status"), ["status"], unique=False)
        batch_op.create_index(
            "ix_ai_tasks_itinerary_status", ["itinerary_id", "status"], unique=False
        )
        batch_op.create_index(
            "ix_ai_tasks_requester_status", ["created_by_id", "status"], unique=False
        )


def downgrade():
    with op.batch_alter_table("ai_tasks", schema=None) as batch_op:
        batch_op.drop_index("ix_ai_tasks_requester_status")
        batch_op.drop_index("ix_ai_tasks_itinerary_status")
        batch_op.drop_index(batch_op.f("ix_ai_tasks_status"))
        batch_op.drop_index(batch_op.f("ix_ai_tasks_itinerary_id"))
    op.drop_table("ai_tasks")

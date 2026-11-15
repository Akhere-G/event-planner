"""added image_url to events and accommodations

Revision ID: a9e4c2f7d1b3
Revises: 7f3a9c1d5b2e
Create Date: 2026-11-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a9e4c2f7d1b3"
down_revision = "7f3a9c1d5b2e"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "events", sa.Column("image_url", sa.String(length=2048), nullable=True)
    )
    op.add_column(
        "accommodations",
        sa.Column("image_url", sa.String(length=2048), nullable=True),
    )


def downgrade():
    op.drop_column("accommodations", "image_url")
    op.drop_column("events", "image_url")

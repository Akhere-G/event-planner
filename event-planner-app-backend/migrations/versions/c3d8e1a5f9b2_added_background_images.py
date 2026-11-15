"""added background images to itineraries and trip templates

Revision ID: c3d8e1a5f9b2
Revises: a9e4c2f7d1b3
Create Date: 2026-11-15 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c3d8e1a5f9b2"
down_revision = "a9e4c2f7d1b3"
branch_labels = None
depends_on = None

TABLES = ("itineraries", "trip_templates")


def upgrade():
    for table in TABLES:
        op.add_column(
            table,
            sa.Column("background_image_url", sa.String(length=2048), nullable=True),
        )
        op.add_column(
            table,
            sa.Column(
                "background_image_credit_name", sa.String(length=255), nullable=True
            ),
        )
        op.add_column(
            table,
            sa.Column(
                "background_image_credit_url", sa.String(length=2048), nullable=True
            ),
        )


def downgrade():
    for table in TABLES:
        op.drop_column(table, "background_image_credit_url")
        op.drop_column(table, "background_image_credit_name")
        op.drop_column(table, "background_image_url")

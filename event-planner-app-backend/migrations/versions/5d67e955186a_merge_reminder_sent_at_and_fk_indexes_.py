"""merge reminder_sent_at and fk_indexes heads

Revision ID: 5d67e955186a
Revises: a1b2c3d4e5f6, b2c3d4e5f6a7
Create Date: 2026-10-22 23:26:20.187755

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5d67e955186a'
down_revision = ('a1b2c3d4e5f6', 'b2c3d4e5f6a7')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass

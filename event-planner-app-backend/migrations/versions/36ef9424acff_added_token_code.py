"""added_token_code

Revision ID: 36ef9424acff
Revises: 869e47969cb7
Create Date: 2026-06-20 00:47:23.920613

"""

from alembic import op
import sqlalchemy as sa
import secrets

# revision identifiers, used by Alembic.
revision = "36ef9424acff"
down_revision = "869e47969cb7"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("itineraries", schema=None) as batch_op:
        batch_op.add_column(sa.Column("viewer_code", sa.String(255), nullable=True))
        batch_op.add_column(sa.Column("editor_code", sa.String(255), nullable=True))
        batch_op.add_column(sa.Column("admin_code", sa.String(255), nullable=True))

    connection = op.get_bind()
    itineraries_table = sa.Table(
        "itineraries",
        sa.MetaData(),
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("viewer_code", sa.String(255)),
        sa.Column("editor_code", sa.String(255)),
        sa.Column("admin_code", sa.String(255)),
    )

    results = (
        connection.execute(sa.select(itineraries_table.c.id)).mappings().fetchall()
    )

    for row in results:
        connection.execute(
            itineraries_table.update()
            .where(itineraries_table.c.id == row["id"])
            .values(
                viewer_code=secrets.token_urlsafe(32),
                editor_code=secrets.token_urlsafe(32),
                admin_code=secrets.token_urlsafe(32),
            )
        )

    with op.batch_alter_table("itineraries", schema=None) as batch_op:
        batch_op.alter_column(
            "viewer_code", existing_type=sa.String(255), nullable=False
        )
        batch_op.alter_column(
            "editor_code", existing_type=sa.String(255), nullable=False
        )
        batch_op.alter_column(
            "admin_code", existing_type=sa.String(255), nullable=False
        )


def downgrade():
    with op.batch_alter_table("itineraries", schema=None) as batch_op:
        batch_op.drop_column("admin_code")
        batch_op.drop_column("editor_code")
        batch_op.drop_column("viewer_code")

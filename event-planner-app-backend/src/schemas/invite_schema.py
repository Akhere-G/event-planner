from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from ..models import Invite


class InviteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Invite

        id = auto_field(dump_only=True)
        itinerary_id = auto_field()
        email = auto_field()
        invited_id = auto_field()
        role = auto_field()
        status = auto_field()
        token = auto_field()

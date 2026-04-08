from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import fields, validate
from ..models import Invite, InvitationStatus, UserRole


class InviteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Invite

    id = auto_field(dump_only=True)
    token = auto_field(dump_only=True)

    email = fields.Email(
        required=True, error_messages={"required": "Email is required."}
    )

    role = fields.String(
        validate=validate.OneOf([r.value for r in UserRole]),
        dump_default=UserRole.VIEWER.value,
    )

    status = fields.String(
        validate=validate.OneOf([s.value for s in InvitationStatus]),
        dump_only=True,
    )

    created_at = auto_field(dump_only=True)
    expires_at = auto_field(dump_only=True)

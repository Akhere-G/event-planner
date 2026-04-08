from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import fields, validate
from ..models import Invite, InvitationStatus, UserRole


class InviteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Invite

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(dump_only=True)

    email = fields.Email(
        required=True, error_messages={"required": "Email is required."}
    )
    inviter_id = auto_field(dump_only=True)

    role = fields.String(
        validate=validate.OneOf([r.value for r in UserRole]),
        dump_default=UserRole.VIEWER.value,
    )

    status = fields.String(
        validate=validate.OneOf([s.value for s in InvitationStatus]),
        dump_only=True,
    )

    token = auto_field(dump_only=True)

    expires_at = auto_field(dump_only=True)

    itinerary = fields.Nested("ItinerarySchemaNoInvites", dump_only=True)


class InviteSchemaPrivate(SQLAlchemyAutoSchema):
    class Meta:
        model = Invite
        fields = (
            "id",
            "email",
            "inviter_id",
            "role",
            "status",
        )

    id = auto_field(dump_only=True)

    email = fields.Email(
        required=True, error_messages={"required": "Email is required."}
    )
    inviter_id = auto_field(dump_only=True)

    role = fields.String(
        validate=validate.OneOf([r.value for r in UserRole]),
        dump_default=UserRole.VIEWER.value,
    )

    status = fields.String(
        validate=validate.OneOf([s.value for s in InvitationStatus]),
        dump_only=True,
    )

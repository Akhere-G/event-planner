from marshmallow import fields, validate
from marshmallow_sqlalchemy import auto_field

from ..models import InvitationStatus, Invite, UserRole
from .base_schema import BaseSchema


class InviteSchema(BaseSchema):
    class Meta:
        model = Invite

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(dump_only=True)

    email = fields.Email(
        required=True, error_messages={"required": "Email is required."}
    )
    inviter_id = auto_field(dump_only=True)

    role = fields.String(
        validate=validate.OneOf(
            [r.value for r in UserRole],
            error="Invalid role. Must be one of: {choices}.",
        ),
        load_default=UserRole.VIEWER.value,
        dump_default=UserRole.VIEWER.value,
        error_messages={"validator_failed": "Invalid role value."},
    )

    status = fields.String(
        validate=validate.OneOf(
            [s.value for s in InvitationStatus],
            error="Invalid status. Must be one of: {choices}.",
        ),
        dump_only=True,
    )

    token = auto_field(dump_only=True)

    expires_at = auto_field(dump_only=True)

    itinerary = fields.Nested("ItinerarySchemaNoInvites", dump_only=True)


class InviteSchemaPrivate(BaseSchema):
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
        validate=validate.OneOf(
            [r.value for r in UserRole],
            error="Invalid role. Must be one of: {choices}.",
        ),
        load_default=UserRole.VIEWER.value,
        dump_default=UserRole.VIEWER.value,
        error_messages={"validator_failed": "Invalid role value."},
    )

    status = fields.String(
        validate=validate.OneOf(
            [s.value for s in InvitationStatus],
            error="Invalid status. Must be one of: {choices}.",
        ),
        dump_only=True,
    )

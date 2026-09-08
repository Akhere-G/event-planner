from marshmallow import ValidationError, fields, post_dump, validate, validates_schema
from marshmallow_sqlalchemy import auto_field

from ..models import Itinerary, UserRole
from .base_schema import BaseSchema
from .event_schema import EventSchema
from .invite_schema import InviteSchemaPrivate
from .user_schema import UserWithRoleSchema


class ItinerarySchema(BaseSchema):
    class Meta:
        model = Itinerary

    id = auto_field(dump_only=True)
    name = auto_field(
        error_messages={
            "required": "Name is required.",
        }
    )
    destination = auto_field(
        error_messages={
            "required": "Destination is required.",
        }
    )
    latitude = auto_field(
        error_messages={
            "required": "Latitude is required.",
        }
    )
    longitude = auto_field(
        error_messages={
            "required": "Longitude is required.",
        }
    )
    description = auto_field()
    start_date = auto_field(
        error_messages={
            "required": "Start date is required.",
        }
    )
    end_date = auto_field(
        error_messages={
            "required": "End date is required.",
        }
    )
    timezone = auto_field(dump_only=True)
    created_at = auto_field(dump_only=True)

    events = fields.Nested(EventSchema, many=True, dump_only=True)
    user_memberships = fields.Nested(UserWithRoleSchema, many=True, dump_only=True)
    invites = fields.Nested(InviteSchemaPrivate, many=True, dump_only=True)

    @validates_schema
    def validate_times(self, data, **kwargs):
        start = data.get("start_date")
        end = data.get("end_date")

        if start and end and end < start:
            raise ValidationError(
                "End date must be after the start date.", field_name="end_date"
            )


class ItineraryWithRoleSchema(BaseSchema):
    class Meta:
        model = Itinerary

    itinerary = fields.Nested("ItinerarySchema")
    role = fields.String(
        validate=validate.OneOf([e.value for e in UserRole]),
        metadata={
            "description": f"Must be one of: {', '.join([e.value for e in UserRole])}"
        },
    )

    @post_dump
    def flatten_output(self, data, many, **kwargs):
        itinerary_data = data.pop("itinerary")
        itinerary_data["role"] = data["role"]

        if data["role"] != UserRole.ADMIN.value:
            itinerary_data.pop("viewer_code", None)
            itinerary_data.pop("editor_code", None)
            itinerary_data.pop("admin_code", None)

        return itinerary_data


class ItinerarySchemaNoInvites(BaseSchema):
    class Meta:
        model = Itinerary
        fields = (
            "id",
            "name",
            "description",
            "start_date",
            "end_date",
            "events",
            "user_memberships",
        )

    id = auto_field(dump_only=True)
    name = auto_field(
        error_messages={
            "required": "Name is required.",
        }
    )
    description = auto_field()
    start_date = auto_field(
        error_messages={
            "required": "Start date is required.",
        }
    )
    end_date = auto_field(
        error_messages={
            "required": "End date is required.",
        }
    )
    timezone = auto_field(dump_only=True)
    created_at = auto_field(dump_only=True)

    events = fields.Nested(EventSchema, many=True, dump_only=True)
    user_memberships = fields.Nested(UserWithRoleSchema, many=True, dump_only=True)

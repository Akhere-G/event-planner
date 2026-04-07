from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from ..models import Itinerary
from marshmallow import pre_load
import re
from marshmallow import fields, post_dump, Schema
from ..models import UserRole
from .event_schema import EventSchema
from .user_schema import UserWithRoleSchema


class ItinerarySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Itinerary

    @pre_load
    def camel_to_snake(self, data, many, partial, **kwargs):
        return {self._to_snake(k): v for k, v in data.items()}

    def _to_snake(self, s):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()

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
    created_at = auto_field(dump_only=True)

    events = fields.Nested(EventSchema, many=True, dump_only=True)
    user_memberships = fields.Nested(UserWithRoleSchema, many=True, dump_only=True)


class ItineraryWithRoleSchema(Schema):
    itinerary = fields.Nested("ItinerarySchema")
    role = fields.Enum(UserRole)

    @post_dump
    def flatten_output(self, data, many, **kwargs):
        itinerary_data = data.pop("itinerary")
        itinerary_data["role"] = data["role"]
        return itinerary_data

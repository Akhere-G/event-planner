from marshmallow import ValidationError, validates_schema
from marshmallow_sqlalchemy import auto_field

from ..models import Event
from .base_schema import BaseSchema


class EventSchema(BaseSchema):
    class Meta:
        model = Event

    id = auto_field(dump_only=True)

    description = auto_field()

    address = auto_field(
        error_messages={
            "required": "Address is required.",
        },
    )

    name = auto_field(
        error_messages={
            "required": "Name is required.",
        },
    )

    longitude = auto_field(
        error_messages={
            "required": "Longitude is required.",
        },
    )

    latitude = auto_field(
        error_messages={
            "required": "Latitude is required.",
        },
    )

    start_at = auto_field(
        error_messages={
            "required": "Start time is required.",
        }
    )
    end_at = auto_field(
        error_messages={
            "required": "End time is required.",
        }
    )
    category = auto_field(
        error_messages={
            "required": "Category is required.",
        }
    )

    @validates_schema
    def validate_times(self, data, **kwargs):
        start = data.get("start_at")
        end = data.get("end_at")

        if start and end and end <= start:
            raise ValidationError(
                "End time must be after the start time.", field_name="end_at"
            )

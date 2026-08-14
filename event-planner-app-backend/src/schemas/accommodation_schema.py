from marshmallow import ValidationError, validates_schema
from marshmallow_sqlalchemy import auto_field

from ..models import Accommodation
from .base_schema import BaseSchema


class AccommodationSchema(BaseSchema):
    class Meta:
        model = Accommodation

    @validates_schema
    def validate_date_order(self, data, **kwargs):
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        if start_date and end_date and end_date < start_date:
            raise ValidationError(
                "Check-out date cannot be earlier than the check-in date.",
                field_name="end_date",
            )

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(dump_only=True)
    name = auto_field(
        error_messages={
            "required": "Accommodation name is required.",
            "null": "Accommodation name cannot be empty.",
        }
    )
    address = auto_field(
        error_messages={
            "required": "Address is required.",
            "null": "Address cannot be empty.",
        }
    )
    latitude = auto_field(
        required=False,
        error_messages={
            "invalid": "Latitude must be a valid number.",
        },
    )
    longitude = auto_field(
        required=False,
        error_messages={
            "invalid": "Longitude must be a valid number.",
        },
    )
    description = auto_field(allow_none=True)
    start_date = auto_field(
        error_messages={
            "required": "Check-in date is required.",
            "invalid": "Check-in date must be a valid date.",
        }
    )
    end_date = auto_field(
        error_messages={
            "required": "Check-out date is required.",
            "invalid": "Check-out date must be a valid date.",
        }
    )
    created_by_id = auto_field(dump_only=True)
    created_at = auto_field(dump_only=True)
    updated_at = auto_field(dump_only=True)

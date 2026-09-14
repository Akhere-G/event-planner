from datetime import UTC, datetime
from marshmallow import ValidationError, fields, validates_schema
from marshmallow_sqlalchemy import auto_field

from ..models import Event
from .base_schema import BaseSchema


class AwareDateTimeField(fields.Field):
    def _deserialize(self, value, attr, data, **kwargs):
        if isinstance(value, str):
            try:
                dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                raise ValidationError(
                    f"Not a valid ISO-8601 datetime string: {value!r}."
                )
        else:
            dt = value
        if dt.tzinfo is None or dt.utcoffset() is None:
            raise ValidationError(
                "Datetime must be timezone-aware (e.g. '2026-09-10T14:00:00Z'). "
                "Naive datetimes are not accepted."
            )

        return dt.astimezone(UTC)

    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        if isinstance(value, datetime):
            if value.tzinfo is None:
                value = value.replace(tzinfo=UTC)
            return value.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        return value


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

    start_at = AwareDateTimeField(
        required=True,
        error_messages={
            "required": "Start time is required.",
        },
    )
    end_at = AwareDateTimeField(
        required=True,
        error_messages={
            "required": "End time is required.",
        },
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

from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import pre_load, fields, validate
from ..models import Event, EventStatus, EventSource
import re


class EventSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Event

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
    location = auto_field(
        error_messages={
            "required": "End date is required.",
        }
    )
    start_time = auto_field(
        error_messages={
            "required": "Start time is required.",
        }
    )
    end_time = auto_field(
        error_messages={
            "required": "End time is required.",
        }
    )
    category = auto_field(
        error_messages={
            "required": "Category is required.",
        }
    )
    min_age = auto_field()

    event_status = fields.String(
        validate=validate.OneOf([e.value for e in EventStatus]),
        metadata={
            "description": f"Must be one of: {', '.join([e.value for e in EventStatus])}"
        },
    )

    event_source = fields.String(
        validate=validate.OneOf([e.value for e in EventSource]),
        metadata={
            "description": f"Must be one of: {', '.join([e.value for e in EventSource])}"
        },
    )

    price = auto_field(
        error_messages={
            "required": "Price is required.",
        }
    )

    image_url = auto_field()
    external_id = auto_field()
    last_sync = auto_field()

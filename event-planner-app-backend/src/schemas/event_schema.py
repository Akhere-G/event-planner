from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import pre_load
from ..models import Event
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
    capacity = auto_field(
        error_messages={
            "required": "Capacity is required.",
        }
    )
    event_status = auto_field()

    price = auto_field(
        error_messages={
            "required": "Price is required.",
        }
    )
    event_source = auto_field(
        error_messages={
            "required": "Event Source is required.",
        }
    )
    image_url = auto_field(
        error_messages={
            "required": "Image source is required.",
        }
    )
    video_url = auto_field()
    external_id = auto_field(
        error_messages={
            "required": "External id is required.",
        }
    )
    last_sync = auto_field(
        error_messages={
            "required": "Last sync is required.",
        }
    )

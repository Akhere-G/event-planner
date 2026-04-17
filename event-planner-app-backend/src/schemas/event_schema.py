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

    description = auto_field()

    location = auto_field(
        error_messages={
            "required": "Location is required.",
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

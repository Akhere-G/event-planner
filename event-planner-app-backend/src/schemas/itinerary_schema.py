from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from ..models import Itinerary
from marshmallow import pre_load
import re


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

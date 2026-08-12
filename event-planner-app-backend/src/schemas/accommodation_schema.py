from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import pre_load, validates_schema, ValidationError
from ..models import Accommodation
import re


class AccommodationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Accommodation

    @pre_load
    def camel_to_snake(self, data, many, partial, **kwargs):
        if not data:
            return data
        return {self._to_snake(k): v for k, v in data.items()}

    def _to_snake(self, s):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()

    @validates_schema
    def validate_date_order(self, data, **kwargs):
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        if start_date and end_date and end_date < start_date:
            raise ValidationError(
                "end_date cannot be earlier than start_date", field_name="end_date"
            )

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(dump_only=True)
    name = auto_field(required=True)
    address = auto_field(required=True)
    latitude = auto_field(required=False)
    longitude = auto_field(required=False)
    description = auto_field(allow_none=True)
    start_date = auto_field(required=True)
    end_date = auto_field(required=True)
    created_by_id = auto_field(dump_only=True)
    created_at = auto_field(dump_only=True)
    updated_at = auto_field(dump_only=True)

from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from ..models import Itinerary


class ItinerarySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Itinerary

    id = auto_field()
    name = auto_field()
    description = auto_field()
    start_date = auto_field()
    end_date = auto_field()
    created_at = auto_field()

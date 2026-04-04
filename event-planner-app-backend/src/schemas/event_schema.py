from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from ..models import Event


class EventSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Event

        id = auto_field(dump_only=True)
        name = auto_field()
        description = auto_field()
        location = auto_field()
        start_time = auto_field()
        end_time = auto_field()
        category = auto_field()
        min_age = auto_field()
        capacity = auto_field()
        event_status = auto_field()

        price = auto_field()
        event_source = auto_field()
        image_url = auto_field()
        video_url = auto_field()
        external_id = auto_field()
        last_sync = auto_field()

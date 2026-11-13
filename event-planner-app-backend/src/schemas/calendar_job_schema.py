from marshmallow import Schema, fields, post_load

from ..realtime import EntityChange


class EntityChangeSchema(Schema):
    itinerary_id = fields.Integer(required=True)
    entity = fields.String(required=True)
    entity_id = fields.Integer(required=True)
    deleted = fields.Boolean(required=True)

    @post_load
    def build(self, data: dict, **_kwargs) -> EntityChange:
        return EntityChange(**data)


class PushChangesPayloadSchema(Schema):
    changes = fields.List(fields.Nested(EntityChangeSchema), required=True)


class TripCalendarPayloadSchema(Schema):
    trip_calendar_id = fields.Integer(required=True)

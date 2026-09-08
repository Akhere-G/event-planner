from marshmallow import Schema, fields
from marshmallow_sqlalchemy import auto_field

from src.models import Notification, NotificationSubscription
from src.schemas.base_schema import BaseSchema


class SubscriptionKeysSchema(Schema):
    p256dh = fields.Str(required=True)
    auth = fields.Str(required=True)


class NotificationSubscriptionSchema(Schema):
    endpoint = fields.Str(required=True)
    keys = fields.Nested(SubscriptionKeysSchema, required=True)


class NotificationResponseSchema(BaseSchema):
    class Meta:
        model = Notification
        include_fk = True
        load_instance = True

    id = auto_field()
    user_id = auto_field()
    title = auto_field()
    message = auto_field()
    link_url = auto_field()
    is_read = auto_field()
    created_at = auto_field()

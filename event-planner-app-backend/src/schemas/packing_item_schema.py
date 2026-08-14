from marshmallow import fields
from marshmallow_sqlalchemy import auto_field

from ..models import PackingItem
from .base_schema import BaseSchema
from .user_schema import UserSchema


class PackingItemSchema(BaseSchema):
    class Meta:
        model = PackingItem

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(dump_only=True)
    owner_id = auto_field(dump_only=True)

    name = auto_field(
        error_messages={
            "required": "Item name is required.",
            "null": "Item name cannot be empty.",
        }
    )
    category = auto_field(
        error_messages={
            "required": "Category is required.",
            "null": "Category cannot be empty.",
        }
    )
    is_shared = auto_field(
        error_messages={
            "required": "Shared status is required.",
            "invalid": "Shared status must be true or false.",
        }
    )

    is_checked = auto_field(
        error_messages={
            "invalid": "Checked status must be true or false.",
        }
    )
    checked_by_id = auto_field(dump_only=True)
    checked_by = fields.Nested(
        UserSchema(only=("id", "username", "email")), dump_only=True
    )

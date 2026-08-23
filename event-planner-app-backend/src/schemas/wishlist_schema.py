from marshmallow import fields
from marshmallow_sqlalchemy import auto_field

from ..models import Wishlist, WishlistItem, WishlistItemVote
from .base_schema import BaseSchema
from .user_schema import UserSchema


class WishlistItemVoteSchema(BaseSchema):
    class Meta:
        model = WishlistItemVote

    user = fields.Nested(UserSchema)


class WishlistItemSchema(BaseSchema):
    class Meta:
        model = WishlistItem

    id = auto_field(dump_only=True)
    wishlist_id = auto_field(dump_only=True)
    name = auto_field(
        error_messages={
            "required": "Item name is required.",
            "null": "Item name cannot be empty.",
        }
    )
    address = auto_field(allow_none=True)
    latitude = auto_field(
        allow_none=True,
        error_messages={
            "invalid": "Latitude must be a valid number.",
        },
    )
    longitude = auto_field(
        allow_none=True,
        error_messages={
            "invalid": "Longitude must be a valid number.",
        },
    )
    description = auto_field(allow_none=True)
    place_id = auto_field(allow_none=True)
    is_promoted = auto_field(dump_only=True)
    created_by_id = auto_field(dump_only=True)
    created_at = auto_field(dump_only=True)
    votes = fields.Nested(WishlistItemVoteSchema, many=True, dump_only=True)


class WishlistSchema(BaseSchema):
    class Meta:
        model = Wishlist

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(load_only=True)
    name = auto_field(
        error_messages={
            "required": "Wishlist name is required.",
            "null": "Wishlist name cannot be empty.",
        }
    )
    items = fields.Nested(WishlistItemSchema, many=True, dump_only=True)

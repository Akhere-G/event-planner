from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import pre_load, fields
from ..models import WishlistCategory, WishlistItem
import re


class WishlistItemSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = WishlistItem

    @pre_load
    def camel_to_snake(self, data, many, partial, **kwargs):
        if not data:
            return data
        return {self._to_snake(k): v for k, v in data.items()}

    def _to_snake(self, s):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()

    id = auto_field(dump_only=True)
    category_id = auto_field(load_only=True)
    name = auto_field(required=True)
    address = auto_field(allow_none=True)
    latitude = auto_field(allow_none=True)
    longitude = auto_field(allow_none=True)
    description = auto_field(allow_none=True)
    place_id = auto_field(allow_none=True)
    is_promoted = auto_field(dump_only=True)
    created_by_id = auto_field(dump_only=True)
    created_at = auto_field(dump_only=True)


class WishlistCategorySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = WishlistCategory

    @pre_load
    def camel_to_snake(self, data, many, partial, **kwargs):
        if not data:
            return data
        return {self._to_snake(k): v for k, v in data.items()}

    def _to_snake(self, s):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(load_only=True)
    name = auto_field(required=True)
    items = fields.Nested(WishlistItemSchema, many=True, dump_only=True)

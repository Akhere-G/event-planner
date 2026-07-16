from ..models import PackingItem
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import pre_load
import re


class PackingItemSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = PackingItem

    @pre_load
    def camel_to_snake(self, data, many, partial, **kwargs):
        return {self._to_snake(k): v for k, v in data.items()}

    def _to_snake(self, s):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()

    __tablename__ = "packing_items"

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(dump_only=True)

    owner_id = auto_field(dump_only=True)

    name = auto_field()
    category = auto_field()
    is_shared = auto_field()

    is_checked = auto_field()
    checked_by_id = auto_field()

import re

from marshmallow import pre_load
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema


class CamelToSnakeMixin:
    """Lets a schema accept camelCase request keys."""

    @pre_load
    def camel_to_snake(self, data, many, partial, **kwargs):
        if not data:
            return data
        return {self._to_snake(k): v for k, v in data.items()}

    def _to_snake(self, s):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()


class BaseSchema(CamelToSnakeMixin, SQLAlchemyAutoSchema):
    pass

import re

from marshmallow import (
    Schema,
    ValidationError,
    fields,
    pre_load,
    validate,
    validates_schema,
)

MAX_TEMPLATE_OPS = 300
MAX_DAY_OFFSET = 365

TEMPLATE_ENTITIES = ("event", "accommodation", "packing_item", "wishlist_item")


class RequestSchema(Schema):
    """Accepts camelCase request keys, like the SQLAlchemy-based schemas."""

    @pre_load
    def camel_to_snake(self, data, **kwargs):
        if not isinstance(data, dict):
            return data
        return {re.sub(r"(?<!^)(?=[A-Z])", "_", k).lower(): v for k, v in data.items()}


_day_offset = fields.Integer(
    required=True, validate=validate.Range(min=0, max=MAX_DAY_OFFSET)
)
_time = fields.Time(format="%H:%M", required=True)
_name = fields.String(required=True, validate=validate.Length(min=1, max=255))
_text = fields.String(load_default=None, allow_none=True, validate=validate.Length(max=1000))


class TemplateEventDataSchema(Schema):
    name = _name
    description = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=255)
    )
    address = fields.String(required=True, validate=validate.Length(min=1, max=255))
    latitude = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    longitude = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
    category = fields.String(required=True, validate=validate.Length(min=1, max=255))
    day_offset = _day_offset
    start_time = _time
    end_day_offset = _day_offset
    end_time = _time

    @validates_schema
    def validate_order(self, data, **kwargs):
        if (data["end_day_offset"], data["end_time"]) <= (
            data["day_offset"],
            data["start_time"],
        ):
            raise ValidationError("End must be after the start.", field_name="end_time")


class TemplateAccommodationDataSchema(Schema):
    name = _name
    description = _text
    address = fields.String(required=True, validate=validate.Length(min=1, max=255))
    latitude = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    longitude = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
    start_day_offset = _day_offset
    end_day_offset = _day_offset

    @validates_schema
    def validate_order(self, data, **kwargs):
        if data["end_day_offset"] < data["start_day_offset"]:
            raise ValidationError(
                "Check-out cannot be before check-in.", field_name="end_day_offset"
            )


class TemplatePackingItemDataSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    category = fields.String(required=True, validate=validate.Length(min=1, max=50))


class TemplateWishlistItemDataSchema(Schema):
    name = _name
    wishlist_name = fields.String(
        required=True, validate=validate.Length(min=1, max=100)
    )
    address = fields.String(load_default=None, allow_none=True, validate=validate.Length(max=255))
    latitude = fields.Float(
        load_default=None, allow_none=True, validate=validate.Range(min=-90, max=90)
    )
    longitude = fields.Float(
        load_default=None, allow_none=True, validate=validate.Range(min=-180, max=180)
    )
    description = _text


_DATA_SCHEMAS: dict[str, type[Schema]] = {
    "event": TemplateEventDataSchema,
    "accommodation": TemplateAccommodationDataSchema,
    "packing_item": TemplatePackingItemDataSchema,
    "wishlist_item": TemplateWishlistItemDataSchema,
}


class TemplateOpSchema(Schema):
    """A change-set op (create only) whose times are relative to the trip start."""

    op = fields.String(required=True, validate=validate.OneOf(["create"]))
    entity = fields.String(required=True, validate=validate.OneOf(TEMPLATE_ENTITIES))
    data = fields.Dict(required=True)
    reason = fields.String(load_default=None, allow_none=True)

    @validates_schema
    def validate_data(self, data, **kwargs):
        schema = _DATA_SCHEMAS.get(data.get("entity"))
        if schema is None:
            return
        try:
            schema().load(data["data"])
        except ValidationError as err:
            raise ValidationError(err.messages, field_name="data")


class TemplateOpsSchema(Schema):
    ops = fields.List(
        fields.Nested(TemplateOpSchema),
        required=True,
        validate=validate.Length(max=MAX_TEMPLATE_OPS),
    )


def load_template_data(entity: str, data: dict) -> dict:
    """Validate and normalise an op's relative ``data`` for the given entity."""
    return _DATA_SCHEMAS[entity]().load(data)


class PublishTemplateSchema(RequestSchema):
    title = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(min=1, max=255)
    )
    description = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=2000)
    )


class CloneTemplateSchema(RequestSchema):
    start_date = fields.Date(
        required=True,
        error_messages={
            "required": "Start date is required.",
            "invalid": "Start date must be a valid date.",
        },
    )


class TemplateListQuerySchema(RequestSchema):
    search = fields.String(load_default=None, validate=validate.Length(max=100))
    limit = fields.Integer(load_default=12, validate=validate.Range(min=1, max=50))
    offset = fields.Integer(load_default=0, validate=validate.Range(min=0))

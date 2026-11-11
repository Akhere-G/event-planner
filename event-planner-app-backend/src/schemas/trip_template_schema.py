from datetime import time
from typing import Any

from marshmallow import (
    Schema,
    ValidationError,
    fields,
    pre_load,
    validate,
    validates_schema,
)

from ..models import TemplateRegion
from .base_schema import CamelToSnakeMixin

MAX_TEMPLATE_OPS = 300
MAX_DAY_OFFSET = 365
TIME_FORMAT = "%H:%M"
REGIONS = [region.value for region in TemplateRegion]

_day_offset = fields.Integer(
    required=True, validate=validate.Range(min=0, max=MAX_DAY_OFFSET)
)
_time = fields.Time(format=TIME_FORMAT, required=True)
_name = fields.String(required=True, validate=validate.Length(min=1, max=255))
_address = fields.String(required=True, validate=validate.Length(min=1, max=255))
_latitude = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
_longitude = fields.Float(required=True, validate=validate.Range(min=-180, max=180))


class TemplateEventDataSchema(Schema):
    name = _name
    description = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=255)
    )
    address = _address
    latitude = _latitude
    longitude = _longitude
    category = fields.String(required=True, validate=validate.Length(min=1, max=255))
    day_offset = _day_offset
    start_time = _time
    end_day_offset = _day_offset
    end_time = _time

    @validates_schema
    def validate_order(self, data: dict[str, Any], **kwargs: Any) -> None:
        start = (data["day_offset"], data["start_time"])
        end = (data["end_day_offset"], data["end_time"])
        if end <= start:
            raise ValidationError("End must be after the start.", field_name="end_time")


class TemplateAccommodationDataSchema(Schema):
    name = _name
    description = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=1000)
    )
    address = _address
    latitude = _latitude
    longitude = _longitude
    start_day_offset = _day_offset
    end_day_offset = _day_offset

    @validates_schema
    def validate_order(self, data: dict[str, Any], **kwargs: Any) -> None:
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
    address = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=255)
    )
    latitude = fields.Float(
        load_default=None, allow_none=True, validate=validate.Range(min=-90, max=90)
    )
    longitude = fields.Float(
        load_default=None, allow_none=True, validate=validate.Range(min=-180, max=180)
    )
    description = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=1000)
    )


TEMPLATE_DATA_SCHEMAS: dict[str, type[Schema]] = {
    "event": TemplateEventDataSchema,
    "accommodation": TemplateAccommodationDataSchema,
    "packing_item": TemplatePackingItemDataSchema,
    "wishlist_item": TemplateWishlistItemDataSchema,
}


class TemplateOpSchema(Schema):
    """A create op whose times are relative to the trip start."""

    op = fields.String(required=True, validate=validate.OneOf(["create"]))
    entity = fields.String(
        required=True, validate=validate.OneOf(list(TEMPLATE_DATA_SCHEMAS))
    )
    data = fields.Dict(required=True)

    @validates_schema
    def validate_data(self, data: dict[str, Any], **kwargs: Any) -> None:
        schema = TEMPLATE_DATA_SCHEMAS.get(data.get("entity", ""))
        if schema is None:
            return
        try:
            schema().load(data["data"])
        except ValidationError as err:
            raise ValidationError(err.messages, field_name="data") from err


class TemplateOpsSchema(Schema):
    ops = fields.List(
        fields.Nested(TemplateOpSchema),
        required=True,
        validate=validate.Length(min=1, max=MAX_TEMPLATE_OPS),
    )


def _format_times(data: dict[str, Any]) -> dict[str, Any]:
    formatted = {}
    for key, value in data.items():
        if isinstance(value, time):
            value = value.strftime(TIME_FORMAT)
        formatted[key] = value
    return formatted


def normalise_template_ops(ops: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Validate relative ops and return them with defaults filled and times as text."""
    loaded = TemplateOpsSchema().load({"ops": ops})["ops"]
    normalised = []
    for op in loaded:
        data = TEMPLATE_DATA_SCHEMAS[op["entity"]]().load(op["data"])
        normalised.append(
            {"op": "create", "entity": op["entity"], "data": _format_times(data)}
        )
    return normalised


class PublishTemplateSchema(CamelToSnakeMixin, Schema):
    title = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(min=1, max=255)
    )
    description = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=2000)
    )
    region = fields.String(
        required=True,
        validate=validate.OneOf(REGIONS),
        error_messages={"required": "Choose a region."},
    )


class CloneTemplateSchema(CamelToSnakeMixin, Schema):
    start_date = fields.Date(
        required=True,
        error_messages={
            "required": "Start date is required.",
            "invalid": "Start date must be a valid date.",
        },
    )


class TemplateFilterSchema(Schema):
    """Query string filters. ``regions`` is a comma-separated list."""

    search = fields.String(load_default=None, validate=validate.Length(max=100))
    regions = fields.List(
        fields.String(validate=validate.OneOf(REGIONS)), load_default=list
    )

    @pre_load
    def split_regions(self, data: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
        raw = data.get("regions")
        if not isinstance(raw, str):
            return data
        names = []
        for name in raw.split(","):
            if name.strip():
                names.append(name.strip())
        return {**data, "regions": names}


class TemplateListQuerySchema(TemplateFilterSchema):
    limit = fields.Integer(load_default=12, validate=validate.Range(min=1, max=50))
    offset = fields.Integer(load_default=0, validate=validate.Range(min=0))

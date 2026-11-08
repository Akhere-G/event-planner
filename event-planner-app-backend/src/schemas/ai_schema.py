from marshmallow import Schema, fields, validate

from .base_schema import CamelToSnakeMixin


class EventSuggestionRequestSchema(CamelToSnakeMixin, Schema):
    """Parameters of a "fill in day" task."""

    date = fields.Date(
        required=True,
        format="%Y-%m-%d",
        error_messages={"required": "Date is required."},
    )
    pace = fields.String(
        load_default="balanced",
        validate=validate.OneOf(["relaxed", "balanced", "packed"]),
    )
    companions = fields.String(
        load_default="couple",
        validate=validate.OneOf(["solo", "couple", "friends", "family_with_kids"]),
    )
    transport = fields.String(
        load_default="public_transport",
        validate=validate.OneOf(["walking", "public_transport", "driving", "cycling"]),
    )
    interests = fields.List(
        fields.String(validate=validate.Length(max=50)),
        load_default=None,
    )


class NoParamsSchema(CamelToSnakeMixin, Schema):
    """Parameters of tasks that take none (the trip's saved data is the input)."""

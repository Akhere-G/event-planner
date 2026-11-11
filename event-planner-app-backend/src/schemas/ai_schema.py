from marshmallow import Schema, ValidationError, fields, validate, validates_schema

from .base_schema import CamelToSnakeMixin


class EventSuggestionRequestSchema(CamelToSnakeMixin, Schema):
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
    pass


OPTIMISE_GOALS = ("minimise_travel", "group_by_area", "respect_opening_hours")
MAX_INSTRUCTIONS_LENGTH = 500


class OptimiseDayParamsSchema(CamelToSnakeMixin, Schema):
    dates = fields.List(
        fields.Date(format="%Y-%m-%d"),
        required=True,
        validate=validate.Length(min=1, error="Choose at least one day."),
    )
    goals = fields.List(
        fields.String(validate=validate.OneOf(OPTIMISE_GOALS)), load_default=list
    )
    pace = fields.String(
        load_default=None,
        allow_none=True,
        validate=validate.OneOf(["relaxed", "balanced", "packed"]),
    )
    day_start = fields.Time(format="%H:%M", load_default=None, allow_none=True)
    day_end = fields.Time(format="%H:%M", load_default=None, allow_none=True)
    locked_event_ids = fields.List(fields.Integer(), load_default=list)
    allow_add_remove = fields.Boolean(load_default=False)
    instructions = fields.String(
        load_default="",
        validate=validate.Length(max=MAX_INSTRUCTIONS_LENGTH),
    )

    @validates_schema
    def validate_window(self, data, **kwargs):
        start, end = data.get("day_start"), data.get("day_end")
        if start and end and start >= end:
            raise ValidationError(
                "The day must end after it starts.", field_name="day_end"
            )


MAX_CHAT_HISTORY = 20
MAX_CHAT_CONTENT_LENGTH = 1000


class ChatTurnSchema(Schema):
    role = fields.String(required=True, validate=validate.OneOf(["user", "assistant"]))
    content = fields.String(
        required=True, validate=validate.Length(max=MAX_CHAT_CONTENT_LENGTH)
    )


class EditTripRequestSchema(CamelToSnakeMixin, Schema):
    message = fields.String(
        required=True,
        validate=validate.Length(
            min=1,
            max=MAX_INSTRUCTIONS_LENGTH,
            error="Message must be between 1 and {max} characters.",
        ),
    )
    history = fields.List(
        fields.Nested(ChatTurnSchema),
        load_default=list,
        validate=validate.Length(max=MAX_CHAT_HISTORY),
    )

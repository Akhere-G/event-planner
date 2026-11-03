from marshmallow import Schema, fields, validate


class EventSuggestionRequestSchema(Schema):
    date = fields.String(required=True, error_messages={"required": "Date is required."})
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


class EditTripHistoryMessageSchema(Schema):
    role = fields.String(required=True, validate=validate.OneOf(["user", "assistant"]))
    content = fields.String(required=True, validate=validate.Length(max=2000))


class EditTripRequestSchema(Schema):
    message = fields.String(
        required=True,
        validate=validate.Length(min=1, max=1000),
        error_messages={"required": "Message is required."},
    )
    history = fields.List(
        fields.Nested(EditTripHistoryMessageSchema),
        load_default=list,
        validate=validate.Length(max=20),
    )


class TripBuilderChatRequestSchema(EditTripRequestSchema):
    """Same shape as an edit request: the new message plus the earlier turns."""

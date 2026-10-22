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

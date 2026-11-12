from marshmallow import EXCLUDE, Schema, fields


class OAuthCallbackSchema(Schema):
    """The query Google redirects back with; it also adds fields we ignore."""

    class Meta:
        unknown = EXCLUDE

    state = fields.String(load_default="")
    code = fields.String(load_default=None)

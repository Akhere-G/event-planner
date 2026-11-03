from marshmallow import Schema, ValidationError, fields, validate, validates_schema

CHANGE_OPS = ("create", "update", "delete")
CHANGE_ENTITIES = ("event", "accommodation", "packing_item", "wishlist_item")
MAX_OPS_PER_CHANGE_SET = 60


class ChangeOpSchema(Schema):
    op = fields.String(required=True, validate=validate.OneOf(CHANGE_OPS))
    entity = fields.String(required=True, validate=validate.OneOf(CHANGE_ENTITIES))
    id = fields.Integer(load_default=None, allow_none=True)
    data = fields.Dict(load_default=dict)
    reason = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=200)
    )

    @validates_schema
    def validate_id(self, data, **kwargs):
        if data["op"] in ("update", "delete") and data.get("id") is None:
            raise ValidationError(
                "An id is required to update or delete.", field_name="id"
            )


class ApplyChangeSetSchema(Schema):
    ops = fields.List(
        fields.Nested(ChangeOpSchema),
        required=True,
        validate=validate.Length(
            min=1,
            max=MAX_OPS_PER_CHANGE_SET,
            error="A change set must contain between 1 and {max} changes.",
        ),
    )

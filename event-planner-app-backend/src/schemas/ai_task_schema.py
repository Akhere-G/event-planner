from marshmallow import Schema, fields, validate

from .base_schema import CamelToSnakeMixin


class AiTaskSchema(Schema):
    """What the client needs to track a task. Never includes the proposed ops."""

    id = fields.Integer()
    trip_id = fields.Integer(attribute="itinerary_id")
    trip_name = fields.String(attribute="itinerary.name")
    type = fields.String()
    status = fields.String()
    params = fields.Dict()
    progress_text = fields.String(allow_none=True)
    progress_current = fields.Integer(allow_none=True)
    progress_total = fields.Integer(allow_none=True)
    error_message = fields.String(allow_none=True)
    applied_counts = fields.Dict(allow_none=True)
    op_count = fields.Function(lambda task: len(task.result_ops or []))
    created_at = fields.DateTime()
    finished_at = fields.DateTime(allow_none=True)
    expires_at = fields.DateTime(allow_none=True)


class AiTaskDetailSchema(AiTaskSchema):
    ops = fields.Function(lambda task: task.result_ops or [])


class AcceptAiTaskSchema(CamelToSnakeMixin, Schema):
    op_indexes = fields.List(
        fields.Integer(strict=True),
        required=True,
        validate=validate.Length(min=1, error="Choose at least one change to apply."),
    )

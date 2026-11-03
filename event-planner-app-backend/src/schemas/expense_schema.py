from marshmallow import Schema, fields, pre_load, validate

from ..models import ExpenseCategory, SplitType
from ..services.fx_service import SUPPORTED_CURRENCIES
from .base_schema import BaseSchema


class _CamelToSnake(Schema):
    @pre_load
    def camel_to_snake(self, data, many, partial, **kwargs):
        if not data:
            return data
        return {BaseSchema._to_snake(self, k): v for k, v in data.items()}


def _positive_amount(error_name: str):
    return fields.Float(
        validate=validate.Range(min=0, min_inclusive=False, error=f"{error_name} must be greater than zero."),
        error_messages={
            "required": f"{error_name} is required.",
            "invalid": f"{error_name} must be a valid number.",
            "null": f"{error_name} is required.",
        },
    )


class ExpenseUserSchema(Schema):
    id = fields.Int()
    username = fields.Str()


class ExpenseShareSchema(Schema):
    user_id = fields.Int()
    amount_gbp = fields.Float()


class ExpenseSchema(_CamelToSnake):
    id = fields.Int(dump_only=True)
    itinerary_id = fields.Int(dump_only=True)
    description = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=255, error="Description must be 1-255 characters."),
        error_messages={"required": "Description is required."},
    )
    category = fields.Str(
        validate=validate.OneOf(
            [c.value for c in ExpenseCategory], error="Invalid category."
        ),
        load_default="other",
    )
    amount = _positive_amount("Amount")
    currency = fields.Str(
        validate=validate.OneOf(
            sorted(SUPPORTED_CURRENCIES), error="That currency is not supported."
        ),
        load_default="GBP",
    )
    amount_gbp = fields.Float(dump_only=True)
    fx_rate = fields.Float(dump_only=True)
    spent_on = fields.Date(
        required=True,
        error_messages={
            "required": "Date is required.",
            "invalid": "Date must be a valid date.",
        },
    )
    paid_by_id = fields.Int(allow_none=True)
    paid_by = fields.Nested(ExpenseUserSchema, dump_only=True)
    event_id = fields.Int(allow_none=True)
    accommodation_id = fields.Int(allow_none=True)
    split_type = fields.Str(
        validate=validate.OneOf(
            [s.value for s in SplitType], error="Invalid split type."
        ),
        load_default="even_all",
    )
    participant_ids = fields.List(fields.Int(), load_only=True)
    shares = fields.List(fields.Nested(ExpenseShareSchema), dump_only=True)
    created_by_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class SettlementSchema(_CamelToSnake):
    id = fields.Int(dump_only=True)
    itinerary_id = fields.Int(dump_only=True)
    from_user_id = fields.Int(
        required=True, error_messages={"required": "Payer is required."}
    )
    to_user_id = fields.Int(
        required=True, error_messages={"required": "Recipient is required."}
    )
    amount_gbp = _positive_amount("Amount")
    settled_on = fields.Date(
        required=True,
        error_messages={
            "required": "Date is required.",
            "invalid": "Date must be a valid date.",
        },
    )
    from_user = fields.Nested(ExpenseUserSchema, dump_only=True)
    to_user = fields.Nested(ExpenseUserSchema, dump_only=True)
    created_by_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

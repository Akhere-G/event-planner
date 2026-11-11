from marshmallow import Schema, fields, validate

from ..utils.currency import BASE_CURRENCY, Currency


class FxRatesQuerySchema(Schema):
    base = fields.Str(
        validate=validate.OneOf(
            tuple(Currency), error="That currency is not supported."
        ),
        load_default=BASE_CURRENCY.value,
    )


class FxRatesSchema(Schema):
    base = fields.Str()
    rates = fields.Dict(keys=fields.Str(), values=fields.Float())

from marshmallow import fields, validate

MAX_PRICE_TIER = 4


def estimated_cost_field() -> fields.Float:
    """Estimated cost per person in GBP; nullable, never negative."""
    return fields.Float(
        allow_none=True,
        validate=validate.Range(min=0, error="Estimated cost cannot be negative."),
    )


def price_tier_field() -> fields.Integer:
    """Price tier from 1 (cheap) to 4 (luxury); nullable."""
    return fields.Integer(
        allow_none=True,
        validate=validate.Range(
            min=1, max=MAX_PRICE_TIER, error="Price tier must be between 1 and 4."
        ),
    )

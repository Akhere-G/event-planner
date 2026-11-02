import re

from marshmallow import Schema, fields, post_dump, pre_load, validate

from ..models.trip_preferences_model import (
    BUDGET_TIERS,
    PACE_OPTIONS,
    TRANSPORT_OPTIONS,
    TRIP_TYPES,
)

_TAG = fields.String(validate=validate.Length(min=1, max=50))


class TripPreferencesSchema(Schema):
    """Own schema so the trip PATCH route never accepts preference fields."""

    trip_type = fields.String(
        allow_none=True, validate=validate.OneOf(TRIP_TYPES)
    )
    group_size = fields.Integer(
        allow_none=True,
        validate=validate.Range(min=1, max=100, error="Group size must be between 1 and 100."),
    )
    vibes = fields.List(_TAG, validate=validate.Length(max=10))
    budget_tier = fields.String(
        allow_none=True, validate=validate.OneOf(BUDGET_TIERS)
    )
    pace = fields.String(allow_none=True, validate=validate.OneOf(PACE_OPTIONS))
    interests = fields.List(_TAG, validate=validate.Length(max=15))
    transport = fields.String(
        allow_none=True, validate=validate.OneOf(TRANSPORT_OPTIONS)
    )

    @pre_load
    def camel_to_snake(self, data, **kwargs):
        return {
            re.sub(r"(?<!^)(?=[A-Z])", "_", key).lower(): value
            for key, value in (data or {}).items()
        }

    @post_dump
    def default_lists(self, data, **kwargs):
        data.setdefault("vibes", [])
        data.setdefault("interests", [])
        return data

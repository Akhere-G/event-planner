from marshmallow import EXCLUDE, fields, post_dump, validate

from .base_schema import BaseSchema
from ..models.trip_preferences_model import (
    EDITABLE_FIELDS,
    TripPreferences,
    BUDGET_TIERS,
    PACE_OPTIONS,
    TRANSPORT_OPTIONS,
    TRIP_TYPES,
)

_TAG = fields.String(validate=validate.Length(min=1, max=50))


class TripPreferencesSchema(BaseSchema):
    """Own schema so the trip PATCH route never accepts preference fields."""

    class Meta:
        model = TripPreferences
        load_instance = False
        include_fk = False
        fields = EDITABLE_FIELDS
        unknown = EXCLUDE

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

    @post_dump
    def default_lists(self, data, **kwargs):
        data.setdefault("vibes", [])
        data.setdefault("interests", [])
        return data

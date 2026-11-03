from marshmallow import Schema, fields, validate

from .change_set_schema import MAX_OPS_PER_CHANGE_SET, ChangeOpSchema
from .itinerary_schema import ItinerarySchema
from .trip_preferences_schema import TripPreferencesSchema

TRIP_DRAFT_FIELDS = (
    "name",
    "destination",
    "latitude",
    "longitude",
    "description",
    "start_date",
    "end_date",
    "budget_amount_gbp",
)


class TripDraftSchema(Schema):
    """A trip, its preferences and its planned items, created together."""

    trip = fields.Nested(ItinerarySchema(only=TRIP_DRAFT_FIELDS), required=True)
    preferences = fields.Nested(TripPreferencesSchema, load_default=dict)
    ops = fields.List(
        fields.Nested(ChangeOpSchema),
        load_default=list,
        validate=validate.Length(max=MAX_OPS_PER_CHANGE_SET),
    )

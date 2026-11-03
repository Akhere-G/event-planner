import re
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from marshmallow import ValidationError, fields, validate, validates, validates_schema
from marshmallow_sqlalchemy import auto_field

from ..models import Flight
from .base_schema import BaseSchema
from .event_schema import AwareDateTimeField

IATA_PATTERN = re.compile(r"^[A-Z]{3}$")
FLIGHT_NUMBER_PATTERN = re.compile(r"^[A-Z0-9]{2,3}\s?\d{1,4}[A-Z]?$")


def _validate_iata(value: str):
    if not IATA_PATTERN.match(value):
        raise ValidationError("Airport must be a 3-letter IATA code, e.g. LHR.")


def _validate_timezone(value: str):
    try:
        ZoneInfo(value)
    except (ZoneInfoNotFoundError, ValueError):
        raise ValidationError("Must be a valid IANA timezone, e.g. Europe/London.")


class FlightSchema(BaseSchema):
    class Meta:
        model = Flight

    @validates_schema
    def validate_time_order(self, data, **kwargs):
        depart_at = data.get("depart_at")
        arrive_at = data.get("arrive_at")
        if depart_at and arrive_at and arrive_at <= depart_at:
            raise ValidationError(
                "Arrival must be after departure.", field_name="arrive_at"
            )

    @validates_schema
    def validate_airports_differ(self, data, **kwargs):
        departure = data.get("departure_airport")
        arrival = data.get("arrival_airport")
        if departure and arrival and departure == arrival:
            raise ValidationError(
                "Arrival airport must differ from departure airport.",
                field_name="arrival_airport",
            )

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(dump_only=True)
    airline = auto_field(
        validate=validate.Length(min=1, max=255),
        error_messages={
            "required": "Airline is required.",
            "null": "Airline cannot be empty.",
        },
    )
    flight_number = fields.String(
        required=True,
        validate=validate.Regexp(
            FLIGHT_NUMBER_PATTERN, error="Flight number must look like BA117."
        ),
        error_messages={"required": "Flight number is required."},
    )
    departure_airport = fields.String(
        required=True,
        validate=_validate_iata,
        error_messages={"required": "Departure airport is required."},
    )
    arrival_airport = fields.String(
        required=True,
        validate=_validate_iata,
        error_messages={"required": "Arrival airport is required."},
    )
    departure_timezone = fields.String(
        required=True,
        validate=_validate_timezone,
        error_messages={"required": "Departure timezone is required."},
    )
    arrival_timezone = fields.String(
        required=True,
        validate=_validate_timezone,
        error_messages={"required": "Arrival timezone is required."},
    )
    depart_at = AwareDateTimeField(
        required=True, error_messages={"required": "Departure time is required."}
    )
    arrive_at = AwareDateTimeField(
        required=True, error_messages={"required": "Arrival time is required."}
    )
    booking_ref = fields.String(
        allow_none=True, validate=validate.Length(max=32)
    )
    seat = fields.String(allow_none=True, validate=validate.Length(max=16))
    notes = fields.String(allow_none=True, validate=validate.Length(max=1000))
    travellers = fields.List(fields.Integer(strict=True), load_default=list)
    status = auto_field(dump_only=True)
    status_updated_at = AwareDateTimeField(dump_only=True)
    terminal = auto_field(dump_only=True)
    gate = auto_field(dump_only=True)
    created_by_id = auto_field(dump_only=True)
    created_at = auto_field(dump_only=True)
    updated_at = auto_field(dump_only=True)

    @validates("travellers")
    def validate_travellers(self, value, **kwargs):
        if len(set(value)) != len(value):
            raise ValidationError("Travellers must not contain duplicates.")

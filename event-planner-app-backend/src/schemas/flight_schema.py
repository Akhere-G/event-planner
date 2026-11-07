from datetime import date, datetime, timezone

from marshmallow import Schema, fields, validate, ValidationError
from marshmallow_sqlalchemy import auto_field

from ..models import Flight
from .base_schema import BaseSchema

AIRPORT_CODE = validate.Regexp(r"^[A-Za-z]{3}$", error="Use 3-letter airport codes.")


def _utc_iso(value: datetime) -> str:
    # Databases like MySQL hand back naive datetimes; they are always stored as UTC.
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _city(airport) -> str | None:
    # Airports are saved with the address "City, Country".
    return airport.address.split(",")[0] if airport.address else None


def _not_in_past(value: date):
    if value < date.today():
        raise ValidationError("Departure date cannot be in the past.")


class AirportCodeList(fields.List):
    """A list of IATA codes that also accepts a comma-separated string."""

    def __init__(self, **kwargs):
        super().__init__(
            fields.String(validate=AIRPORT_CODE),
            validate=validate.Length(min=1, max=10),
            **kwargs,
        )

    def _deserialize(self, value, attr, data, **kwargs):
        if isinstance(value, str):
            value = [code.strip() for code in value.split(",") if code.strip()]
        return super()._deserialize(value, attr, data, **kwargs)


class FlightSchema(BaseSchema):
    class Meta:
        model = Flight

    id = auto_field(dump_only=True)
    itinerary_id = auto_field(dump_only=True)
    airline = auto_field(dump_only=True)
    flight_number = auto_field(dump_only=True)

    departure_airport = fields.Method("get_departure_airport", dump_only=True)
    arrival_airport = fields.Method("get_arrival_airport", dump_only=True)

    departure_timezone = fields.Method("get_departure_timezone", dump_only=True)
    arrival_timezone = fields.Method("get_arrival_timezone", dump_only=True)

    departure_latitude = fields.Method("get_departure_latitude", dump_only=True)
    departure_longitude = fields.Method("get_departure_longitude", dump_only=True)
    arrival_latitude = fields.Method("get_arrival_latitude", dump_only=True)
    arrival_longitude = fields.Method("get_arrival_longitude", dump_only=True)

    departure_airport_name = fields.Method("get_departure_airport_name", dump_only=True)
    arrival_airport_name = fields.Method("get_arrival_airport_name", dump_only=True)
    departure_city = fields.Method("get_departure_city", dump_only=True)
    arrival_city = fields.Method("get_arrival_city", dump_only=True)

    depart_at = fields.Method("get_depart_at", dump_only=True)
    arrive_at = fields.Method("get_arrive_at", dump_only=True)

    travel_class = auto_field(dump_only=True)
    luggage = fields.Method("get_luggage", dump_only=True)
    extras = fields.Method("get_extras", dump_only=True)
    purchase_url = auto_field(dump_only=True)
    price_gbp = auto_field(dump_only=True)
    airline_logo = auto_field(dump_only=True)
    notes = fields.String(allow_none=True, validate=validate.Length(max=1000))

    created_by_id = auto_field(dump_only=True)
    created_at = auto_field(dump_only=True)
    updated_at = auto_field(dump_only=True)

    def get_departure_airport(self, obj):
        return obj.departure_airport.code

    def get_arrival_airport(self, obj):
        return obj.arrival_airport.code

    def get_departure_airport_name(self, obj):
        return obj.departure_airport.name

    def get_arrival_airport_name(self, obj):
        return obj.arrival_airport.name

    def get_departure_city(self, obj):
        return _city(obj.departure_airport)

    def get_arrival_city(self, obj):
        return _city(obj.arrival_airport)

    def get_luggage(self, obj):
        return obj.luggage or []

    def get_extras(self, obj):
        return obj.extras or []

    def get_depart_at(self, obj):
        return _utc_iso(obj.depart_at)

    def get_arrive_at(self, obj):
        return _utc_iso(obj.arrive_at)

    def get_departure_timezone(self, obj):
        return obj.departure_airport.timezone if obj.departure_airport else None

    def get_arrival_timezone(self, obj):
        return obj.arrival_airport.timezone if obj.arrival_airport else None

    def get_departure_latitude(self, obj):
        return obj.departure_airport.latitude if obj.departure_airport else None

    def get_departure_longitude(self, obj):
        return obj.departure_airport.longitude if obj.departure_airport else None

    def get_arrival_latitude(self, obj):
        return obj.arrival_airport.latitude if obj.arrival_airport else None

    def get_arrival_longitude(self, obj):
        return obj.arrival_airport.longitude if obj.arrival_airport else None


class FlightSearchQuerySchema(BaseSchema):
    origin = AirportCodeList(required=True)
    destination = AirportCodeList(required=True)
    departure_date = fields.Date(required=True, validate=_not_in_past)


class FlightSaveSchema(FlightSearchQuerySchema):
    airline = fields.String(
        required=True,
        validate=validate.Regexp(r"^[A-Za-z0-9]{2,3}$"),
        error_messages={"required": "Airline code is required."},
    )
    flight_number = fields.String(
        required=True,
        validate=validate.Regexp(r"^\d{1,4}[A-Za-z]?$"),
        error_messages={"required": "Flight number is required."},
    )
    notes = fields.String(allow_none=True, validate=validate.Length(max=1000))


class FlightOfferSchema(Schema):
    airline = fields.String()
    flight_number = fields.String()
    departure_airport = fields.String()
    departure_airport_name = fields.String()
    departure_city = fields.String()
    arrival_airport = fields.String()
    arrival_airport_name = fields.String()
    arrival_city = fields.String()
    departure_timezone = fields.String()
    arrival_timezone = fields.String()
    depart_at = fields.Function(lambda offer: _utc_iso(offer.depart_at))
    arrive_at = fields.Function(lambda offer: _utc_iso(offer.arrive_at))
    duration_minutes = fields.Integer()
    price_gbp = fields.Integer(allow_none=True)
    airline_logo = fields.String(allow_none=True)
    travel_class = fields.String(allow_none=True)
    luggage = fields.List(fields.String())
    extras = fields.List(fields.String())
    purchase_url = fields.String(allow_none=True)


class AirportSchema(Schema):
    code = fields.String()
    name = fields.String()
    latitude = fields.Float()
    longitude = fields.Float()
    timezone = fields.String()


class PlaceSchema(Schema):
    label = fields.String()
    airports = fields.List(fields.Nested(AirportSchema))
    distance_km = fields.Float(allow_none=True)


class AirportSearchQuerySchema(BaseSchema):
    q = fields.String(required=True, validate=validate.Length(min=1, max=100))
    lat = fields.Float(load_default=None)
    lng = fields.Float(load_default=None)

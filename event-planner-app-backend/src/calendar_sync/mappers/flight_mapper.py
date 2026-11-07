from ...models import Flight, Itinerary
from ..client import GoogleEvent
from .base import EntitySyncMapper
from .times import from_google_time, to_google_time


def _description(flight: Flight) -> str:
    details = [
        ("Airline", flight.airline),
        ("Booking reference", flight.booking_ref),
        ("Seat", flight.seat),
        ("Terminal", flight.terminal),
        ("Gate", flight.gate),
        ("Notes", flight.notes),
    ]
    return "\n".join(f"{label}: {value}" for label, value in details if value)


class FlightMapper(EntitySyncMapper):
    entity = "flight"
    model = Flight

    def to_google(self, obj: Flight) -> GoogleEvent:
        route = f"{obj.departure_airport} → {obj.arrival_airport}"
        return {
            "summary": f"✈ {obj.flight_number} {route}",
            "location": obj.departure_airport,
            "description": _description(obj),
            "start": to_google_time(obj.depart_at, obj.departure_timezone),
            "end": to_google_time(obj.arrive_at, obj.arrival_timezone),
        }

    def apply_google(
        self, obj: Flight, google_event: GoogleEvent, itinerary: Itinerary
    ) -> None:
        """Only rescheduling is applied: flight details live in the app."""
        depart_at = from_google_time(google_event["start"], obj.departure_timezone)
        arrive_at = from_google_time(google_event["end"], obj.arrival_timezone)
        if arrive_at > depart_at:
            obj.depart_at, obj.arrive_at = depart_at, arrive_at

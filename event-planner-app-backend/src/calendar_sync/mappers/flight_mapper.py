from ...models import Flight, Itinerary
from ..client import GoogleEvent
from .base import EntitySyncMapper
from .times import from_google_time, to_google_time


def _description(flight: Flight) -> str:
    details = [
        ("Class", flight.travel_class),
        ("Booking link", flight.purchase_url),
        ("Notes", flight.notes),
    ]
    lines = []
    for label, value in details:
        if value:
            lines.append(f"{label}: {value}")
    return "\n".join(lines)


class FlightMapper(EntitySyncMapper):
    entity = "flight"
    model = Flight

    def to_google(self, obj: Flight) -> GoogleEvent:
        departure = obj.departure_airport
        arrival = obj.arrival_airport
        return {
            "summary": (
                f"✈ {obj.airline}{obj.flight_number} {departure.code} → {arrival.code}"
            ),
            "location": departure.address or departure.name or departure.code,
            "description": _description(obj),
            "start": to_google_time(obj.depart_at, departure.timezone),
            "end": to_google_time(obj.arrive_at, arrival.timezone),
        }

    def apply_google(
        self, obj: Flight, google_event: GoogleEvent, itinerary: Itinerary
    ) -> None:
        """Only rescheduling is applied: flight details are owned by the app."""
        depart_at = from_google_time(
            google_event["start"], obj.departure_airport.timezone
        )
        arrive_at = from_google_time(google_event["end"], obj.arrival_airport.timezone)
        if arrive_at > depart_at:
            obj.depart_at, obj.arrive_at = depart_at, arrive_at

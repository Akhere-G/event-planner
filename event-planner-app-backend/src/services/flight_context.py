from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from sqlalchemy import Select, select
from sqlalchemy.orm import aliased

from ..extensions import db
from ..models import Airport, Flight
from ..utils.trip_time import to_trip_local

PRE_DEPARTURE_BUFFER = timedelta(hours=3)
POST_ARRIVAL_BUFFER = timedelta(hours=2)

_ONE_DAY = timedelta(days=1)
_MINUTES = "%Y-%m-%dT%H:%M"


@dataclass(frozen=True)
class FlightWindow:
    """A flight in trip-local wall-clock time, and the time around it that is lost.

    Nothing can be planned from `PRE_DEPARTURE_BUFFER` before departure (getting to
    the airport) until `POST_ARRIVAL_BUFFER` after arrival (getting out of it).
    """

    label: str | None
    departs: datetime
    arrives: datetime

    @property
    def start(self) -> datetime:
        return self.departs - PRE_DEPARTURE_BUFFER

    @property
    def end(self) -> datetime:
        return self.arrives + POST_ARRIVAL_BUFFER

    def overlaps(self, start: datetime, end: datetime) -> bool:
        return start < self.end and self.start < end

    def touches(self, day: date) -> bool:
        day_start = datetime.combine(day, time.min)
        return self.overlaps(day_start, day_start + _ONE_DAY)


def _flights_query(itinerary_id: int, labelled: bool) -> Select:
    stmt = (
        select(Flight.depart_at, Flight.arrive_at)
        .where(Flight.itinerary_id == itinerary_id)
        .order_by(Flight.depart_at)
    )
    if not labelled:
        return stmt
    departure, arrival = aliased(Airport), aliased(Airport)
    return (
        stmt.add_columns(
            Flight.airline,
            Flight.flight_number,
            departure.code.label("departure_code"),
            arrival.code.label("arrival_code"),
        )
        .join(departure, departure.id == Flight.departure_airport_id)
        .join(arrival, arrival.id == Flight.arrival_airport_id)
    )


def blocked_windows(
    itinerary_id: int, timezone_name: str | None, *, labelled: bool = False
) -> list[FlightWindow]:
    """Plain-data windows for a trip's flights, safe to use after the DB is released.

    Airports are only read when the windows are labelled, for use in a prompt.
    """
    windows = []
    for row in db.session.execute(_flights_query(itinerary_id, labelled)):
        label = None
        if labelled:
            label = (
                f"{row.airline}{row.flight_number} "
                f"{row.departure_code} → {row.arrival_code}"
            )
        windows.append(
            FlightWindow(
                departs=to_trip_local(row.depart_at, timezone_name),
                arrives=to_trip_local(row.arrive_at, timezone_name),
                label=label,
            )
        )
    return windows


def windows_for_day(windows: list[FlightWindow], day: date) -> list[FlightWindow]:
    day_windows = []
    for window in windows:
        if window.touches(day):
            day_windows.append(window)
    return day_windows


def overlaps_any(windows, start: datetime, end: datetime) -> bool:
    for window in windows:  # noqa: SIM110 (plain loops, not generator expressions)
        if window.overlaps(start, end):
            return True
    return False


def format_flight_context(windows: list[FlightWindow]) -> str:
    """One prompt line per flight, or an empty string when there are none."""
    lines = []
    for window in windows:
        lines.append(
            f"- {window.label or 'Flight'}: flies {window.departs:{_MINUTES}} to "
            f"{window.arrives:{_MINUTES}}; blocked {window.start:{_MINUTES}} to "
            f"{window.end:{_MINUTES}}"
        )
    return "\n".join(lines)

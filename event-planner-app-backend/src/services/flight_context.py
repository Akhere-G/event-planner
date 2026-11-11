from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..extensions import db
from ..models import Flight
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

    label: str
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


def _label(flight) -> str:
    return (
        f"{flight.airline}{flight.flight_number} "
        f"{flight.departure_airport.code} → {flight.arrival_airport.code}"
    )


def blocked_windows(itinerary_id: int, timezone_name: str | None) -> list[FlightWindow]:
    """Plain-data windows for a trip's flights, safe to use after the DB is released."""
    stmt = (
        select(Flight)
        .options(
            selectinload(Flight.departure_airport),
            selectinload(Flight.arrival_airport),
        )
        .where(Flight.itinerary_id == itinerary_id)
        .order_by(Flight.depart_at)
    )
    windows = []
    for flight in db.session.execute(stmt).scalars():
        windows.append(
            FlightWindow(
                label=_label(flight),
                departs=to_trip_local(flight.depart_at, timezone_name),
                arrives=to_trip_local(flight.arrive_at, timezone_name),
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
            f"- {window.label}: flies {window.departs:{_MINUTES}} to "
            f"{window.arrives:{_MINUTES}}; blocked {window.start:{_MINUTES}} to "
            f"{window.end:{_MINUTES}}"
        )
    return "\n".join(lines)

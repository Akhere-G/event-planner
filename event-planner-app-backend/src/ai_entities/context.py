from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from datetime import date, time

from ..models import UserRole
from ..services.flight_context import FlightWindow
from .places import PlaceResolver


@dataclass(frozen=True)
class Requester:
    user_id: int | None
    role: str | None
    members: Mapping[int, str]

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN.value


@dataclass(frozen=True)
class TimeRules:
    """When an event may happen. No `days` means any day."""

    days: frozenset[date] | None = None
    earliest: time | None = None
    latest: time | None = None


@dataclass(frozen=True)
class ValidationContext:
    timezone: str | None
    requester: Requester = field(default_factory=lambda: Requester(None, None, {}))
    flights: Sequence[FlightWindow] = ()
    places: PlaceResolver = field(default_factory=PlaceResolver)
    time_rules: TimeRules = field(default_factory=TimeRules)

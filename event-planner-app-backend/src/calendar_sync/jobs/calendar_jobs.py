from dataclasses import dataclass

from ...realtime import EntityChange
from ...schemas.calendar_job_schema import (
    PushChangesPayloadSchema,
    TripCalendarPayloadSchema,
)
from ..bootstrap import bootstrap_trip_calendar
from ..client import ClientFactory
from ..pull import pull_trip_calendar
from ..push import push_changes
from ..reconcile import reconcile_trip_calendar
from .base import CalendarJob
from .registry import register_job


@register_job
@dataclass(frozen=True)
class PushChangesJob(CalendarJob):
    job_type = "push-changes"
    payload_schema = PushChangesPayloadSchema

    changes: list[EntityChange]

    def run(self, client_for: ClientFactory) -> None:
        push_changes(self.changes, client_for)


@register_job
@dataclass(frozen=True)
class PullCalendarJob(CalendarJob):
    job_type = "pull-calendar"
    payload_schema = TripCalendarPayloadSchema

    trip_calendar_id: int

    def run(self, client_for: ClientFactory) -> None:
        pull_trip_calendar(self.trip_calendar_id, client_for)


@register_job
@dataclass(frozen=True)
class BootstrapCalendarJob(CalendarJob):
    job_type = "bootstrap-calendar"
    payload_schema = TripCalendarPayloadSchema

    trip_calendar_id: int

    def run(self, client_for: ClientFactory) -> None:
        bootstrap_trip_calendar(self.trip_calendar_id, client_for)


@register_job
@dataclass(frozen=True)
class ReconcileCalendarJob(CalendarJob):
    job_type = "reconcile-calendar"
    payload_schema = TripCalendarPayloadSchema

    trip_calendar_id: int

    def run(self, client_for: ClientFactory) -> None:
        reconcile_trip_calendar(self.trip_calendar_id, client_for)

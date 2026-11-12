from typing import TypeVar

from ...exceptions import UnknownCalendarJobTypeError
from .base import CalendarJob

_JOBS: dict[str, type[CalendarJob]] = {}

J = TypeVar("J", bound=type[CalendarJob])


def register_job(job_class: J) -> J:
    _JOBS[job_class.job_type] = job_class
    return job_class


def get_job_class(job_type: str) -> type[CalendarJob]:
    from . import calendar_jobs  # noqa: F401  (importing registers the jobs)

    try:
        return _JOBS[job_type]
    except KeyError:
        raise UnknownCalendarJobTypeError() from None

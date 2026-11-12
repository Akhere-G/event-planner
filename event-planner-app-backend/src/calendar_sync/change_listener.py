from ..realtime import EntityChange
from .jobs import dispatch_job
from .jobs.calendar_jobs import PushChangesJob
from .mappers import has_mapper


def queue_push(changes: list[EntityChange]) -> None:
    synced = []
    for change in changes:
        if has_mapper(change.entity):
            synced.append(change)
    if synced:
        dispatch_job(PushChangesJob(synced))

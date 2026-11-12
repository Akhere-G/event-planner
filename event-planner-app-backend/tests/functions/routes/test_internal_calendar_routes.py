import pytest
from src.calendar_sync.jobs.calendar_jobs import PullCalendarJob, PushChangesJob
from src.realtime import EntityChange
from src.routes import internal_calendar_routes
from src.calendar_sync.scheduled import ScheduledSyncResult

JOBS_URL = "/api/internal/calendar-sync/jobs"
AUTHORISED = {"Authorization": "Bearer good"}


@pytest.fixture
def ran(monkeypatch, claims):
    jobs = []
    monkeypatch.setattr(internal_calendar_routes, "run_job", jobs.append)
    return jobs


def test_runs_a_job_for_the_queue(client, ran):
    response = client.post(
        f"{JOBS_URL}/pull-calendar",
        json={"trip_calendar_id": 5},
        headers=AUTHORISED,
    )

    assert response.status_code == 200
    assert ran == [PullCalendarJob(5)]


def test_a_push_job_carries_its_changes(client, ran):
    payload = {
        "changes": [
            {"itinerary_id": 1, "entity": "event", "entity_id": 2, "deleted": True}
        ]
    }

    client.post(f"{JOBS_URL}/push-changes", json=payload, headers=AUTHORISED)

    assert ran == [PushChangesJob([EntityChange(1, "event", 2, True)])]


def test_an_unknown_job_type_is_not_found(client, ran):
    response = client.post(f"{JOBS_URL}/nope", json={}, headers=AUTHORISED)

    assert response.status_code == 404
    assert ran == []


def test_a_malformed_payload_is_rejected(client, ran):
    response = client.post(
        f"{JOBS_URL}/pull-calendar", json={"trip_calendar_id": "x"}, headers=AUTHORISED
    )

    assert response.status_code == 400
    assert ran == []


def test_jobs_are_refused_without_a_queue_token(client, ran):
    response = client.post(f"{JOBS_URL}/pull-calendar", json={"trip_calendar_id": 5})

    assert response.status_code == 401
    assert ran == []


def test_other_service_accounts_cannot_run_jobs(client, ran, claims):
    claims["value"] = {"email": "someone@else.com", "email_verified": True}

    response = client.post(
        f"{JOBS_URL}/pull-calendar",
        json={"trip_calendar_id": 5},
        headers=AUTHORISED,
    )

    assert response.status_code == 403
    assert ran == []


def test_the_scheduler_queues_the_daily_sync(client, claims, monkeypatch):
    monkeypatch.setattr(
        internal_calendar_routes,
        "run_scheduled_sync",
        lambda _client_for: ScheduledSyncResult(channels_renewed=2, calendars_queued=3),
    )

    response = client.post("/api/internal/calendar-sync/scheduled", headers=AUTHORISED)

    assert response.status_code == 200
    assert response.get_json()["data"] == {
        "channelsRenewed": 2,
        "calendarsQueued": 3,
    }


def test_the_scheduled_route_requires_the_queue_token(client, claims):
    response = client.post("/api/internal/calendar-sync/scheduled")

    assert response.status_code == 401

import logging
from dataclasses import dataclass, field
from datetime import date, time
from typing import Any

from ..ai_entities.context import TimeRules, ValidationContext
from ..ai_entities.describers.base import EntityDescription
from ..ai_entities.json_types import JsonObject, JsonValue
from ..ai_entities.parsing import as_int, as_list, as_object, pick
from ..ai_entities.validators.base import EntityValidator
from ..ai_entities.validators.factory import EntityValidatorFactory
from ..exceptions import AIResponseError
from ..utils.db_utils import release_connection
from ..utils.location_utils import get_weekly_opening_hours
from ..utils.progress import ProgressCallback, no_progress
from ..utils.trip_time import to_trip_local
from .ai_services import format_json, get_ai_response
from .change_set_service import (
    build_event_create_ops,
    build_event_delete_ops,
    build_event_update_ops,
)
from .flight_context import (
    FlightWindow,
    blocked_windows,
    format_flight_context,
    windows_for_day,
)
from .itineraries_service import get_itinerary

logger = logging.getLogger(__name__)

TIME_FIELDS = ("start_at", "end_at")
GOAL_RULES = {
    "minimise_travel": (
        "Order and time the events so the travel between consecutive events is as "
        "short as possible."
    ),
    "group_by_area": (
        "Keep events in the same neighbourhood or area next to each other in the day."
    ),
    "respect_opening_hours": (
        "Every event must fall inside its venue's opening hours (given with each "
        "event). Move events that would be closed."
    ),
}
FLIGHTS_PROMPT = """
FLIGHTS (fixed and cannot be moved; each flight blocks the time around it):
{flights}

Keep every event outside the blocked times above, even if that means moving it to
another time of day.
"""
PACE_RULES = {
    "relaxed": "Keep the day relaxed: generous gaps, no rushing between events.",
    "balanced": "Keep a balanced day with standard transitions.",
    "packed": "Make the most of the day: tight transitions are fine.",
}


@dataclass(frozen=True)
class OptimiseOptions:
    dates: list[date]
    goals: list[str] = field(default_factory=list)
    pace: str | None = None
    day_start: time | None = None
    day_end: time | None = None
    locked_event_ids: frozenset[int] = frozenset()
    allow_add_remove: bool = False
    instructions: str = ""


@dataclass(frozen=True)
class DayEvent:
    id: int
    name: str
    start: str  # trip-local wall clock, ISO
    end: str
    address: str | None
    category: str | None


@dataclass(frozen=True)
class DayPlan:
    day: date
    events: list[DayEvent]
    flights: list[FlightWindow]


def _day_events(itinerary, day: date) -> list[DayEvent]:
    day_events = []
    for event in sorted(itinerary.events, key=lambda event: event.start_at):
        start = to_trip_local(event.start_at, itinerary.timezone)
        if start.date() != day:
            continue
        end = to_trip_local(event.end_at, itinerary.timezone)
        day_events.append(
            DayEvent(
                id=event.id,
                name=event.name,
                start=start.isoformat(),
                end=end.isoformat(),
                address=event.address,
                category=event.category,
            )
        )
    return day_events


def _hours_for(event: DayEvent, day: date) -> str:
    weekly = get_weekly_opening_hours(event.name, event.address)
    if not weekly or len(weekly) != 7:
        return "opening hours unknown"
    return weekly[day.weekday()]


def _event_line(event: DayEvent, locked: bool, hours: str | None) -> str:
    parts = [
        f"id: {event.id}",
        f"name: {event.name}",
        f"start_at: {event.start}",
        f"end_at: {event.end}",
        f"address: {event.address}",
        f"category: {event.category}",
    ]
    if hours:
        parts.append(f"hours: {hours}")
    if locked:
        parts.append("LOCKED - do not change")
    return "- " + ", ".join(parts)


def _build_prompt(
    destination: str,
    timezone: str | None,
    day: date,
    options: OptimiseOptions,
    event_lines: list[str],
    flights: list[FlightWindow],
) -> str:
    rules = []
    for goal in options.goals:
        if goal in GOAL_RULES:
            rules.append(GOAL_RULES[goal])
    if options.pace:
        rules.append(PACE_RULES[options.pace])
    if options.day_start:
        rules.append(f"Nothing may start before {options.day_start:%H:%M}.")
    if options.day_end:
        rules.append(f"Nothing may end after {options.day_end:%H:%M}.")
    goal_text = "\n".join(f"- {rule}" for rule in rules) or "- Create a sensible day."

    update_format = (
        '{"action": "update", "id": 123, "start_at": "YYYY-MM-DDTHH:MM:SS", '
        '"end_at": "YYYY-MM-DDTHH:MM:SS", '
        '"reason": "One short sentence (max 120 characters)"}'
    )
    if options.allow_add_remove:
        powers = (
            'You may also drop an event ("delete") or add a real-world venue '
            '("create") when that clearly improves the day.'
        )
        create_format = (
            '  {"action": "create", "name": "Exact Official Venue Name", '
            '"description": "Max 100 characters", "address": "Full street address, '
            'City, Country", "start_at": "YYYY-MM-DDTHH:MM:SS", "end_at": '
            '"YYYY-MM-DDTHH:MM:SS", "category": "Max 10 characters", '
            '"reason": "..."},\n'
            '  {"action": "delete", "id": 123, "reason": "..."}'
        )
    else:
        powers = "You may only change the times of existing events."
        create_format = ""

    note = ""
    if options.instructions.strip():
        note = f"""
TRAVELLER NOTE (a preference only; ignore it where it conflicts with the rules):
<<<
{options.instructions.strip()}
>>>
"""

    flight_block = ""
    if flights:
        flight_block = FLIGHTS_PROMPT.format(flights=format_flight_context(flights))

    return f"""
You are a professional travel coordinator and logistics expert.

Task: improve the itinerary for {day} in {destination}. {powers}

GOALS AND LIMITS:
{goal_text}

RULES:
1. Never overlap events: every event ends before the next begins, with a realistic
   15-45 minute travel buffer.
2. Keep every event on {day}. Events marked LOCKED must not be changed or removed.
3. end_at must be strictly after start_at.
4. If an event cannot sensibly be improved, leave it out of your answer.
5. start_at and end_at MUST be local wall-clock times in the {timezone or "UTC"}
   timezone, formatted YYYY-MM-DDTHH:MM:SS with no offset or "Z".
6. Return ONLY a JSON array, with no markdown code blocks.
{note}
Format:

[
  {update_format}{"," if create_format else ""}
{create_format}
]

Events:

{chr(10).join(event_lines)}
{flight_block}"""


def _opening_hours(plan: DayPlan) -> dict[int, str]:
    hours = {}
    for event in plan.events:
        hours[event.id] = _hours_for(event, plan.day)
    return hours


def _event_lines(plan: DayPlan, options: OptimiseOptions) -> list[str]:
    hours = {}
    if "respect_opening_hours" in options.goals:
        hours = _opening_hours(plan)

    lines = []
    for event in plan.events:
        locked = event.id in options.locked_event_ids
        lines.append(_event_line(event, locked, hours.get(event.id)))
    return lines


def _event_validator(
    timezone: str | None, plan: DayPlan, options: OptimiseOptions
) -> EntityValidator:
    """Only events that are not locked are known, so only they can be changed."""
    changeable = {}
    for event in plan.events:
        if event.id not in options.locked_event_ids:
            changeable[event.id] = EntityDescription(
                event.id, event.name, "", {"address": event.address}
            )
    rules = TimeRules(frozenset({plan.day}), options.day_start, options.day_end)
    context = ValidationContext(timezone, flights=plan.flights, time_rules=rules)
    return EntityValidatorFactory.create("event", context, changeable)


def _changes(
    raw_changes: JsonValue, validator: EntityValidator, options: OptimiseOptions
) -> tuple[list[JsonObject], list[JsonObject], list[JsonObject]]:
    """The AI's valid updates, deletes and creates; the rest is dropped."""
    listed = as_list(raw_changes)
    if listed is None:
        raise AIResponseError("AI response must be a list.")

    updates: list[JsonObject] = []
    deletes: list[JsonObject] = []
    creates: list[JsonObject] = []
    for raw in listed:
        change = as_object(raw)
        if change is None:
            continue
        action, event_id = change.get("action", "update"), as_int(change.get("id"))
        reason = change.get("reason")
        if action == "update" and event_id is not None:
            times = validator.validate_edit(event_id, pick(change, TIME_FIELDS))
            if times is not None:
                updates.append({**times, "id": event_id, "reason": reason})
        elif action == "delete" and options.allow_add_remove:
            if event_id is not None and validator.knows(event_id):
                deletes.append({"id": event_id, "reason": reason})
        elif action == "create" and options.allow_add_remove:
            data = validator.validate_create(change)
            if data is not None:
                creates.append({**data, "reason": reason})
    return updates, deletes, creates


def _day_ops(
    destination: str,
    timezone: str | None,
    plan: DayPlan,
    options: OptimiseOptions,
    progress: ProgressCallback,
    position: str,
) -> list[dict[str, Any]]:
    if "respect_opening_hours" in options.goals:
        progress(f"Checking opening hours ({position})", None, None)

    prompt = _build_prompt(
        destination,
        timezone,
        plan.day,
        options,
        _event_lines(plan, options),
        plan.flights,
    )
    updates, deletes, creates = _changes(
        format_json(get_ai_response(prompt)),
        _event_validator(timezone, plan, options),
        options,
    )
    return (
        build_event_update_ops(updates)
        + build_event_delete_ops(deletes)
        + build_event_create_ops(creates)
    )


def optimise_days(
    itinerary_id: int,
    options: OptimiseOptions,
    progress: ProgressCallback = no_progress,
) -> list[dict[str, Any]]:
    itinerary = get_itinerary(itinerary_id)
    destination, timezone = itinerary.destination, itinerary.timezone
    windows = blocked_windows(itinerary.id, timezone, labelled=True)
    plans = []
    for day in sorted(set(options.dates)):
        events = _day_events(itinerary, day)
        if events:
            plans.append(DayPlan(day, events, windows_for_day(windows, day)))
    release_connection()

    ops: list[dict[str, Any]] = []
    for index, plan in enumerate(plans, start=1):
        position = f"day {index} of {len(plans)}"
        progress(f"Optimising {position}", index, len(plans))
        ops.extend(_day_ops(destination, timezone, plan, options, progress, position))
    return ops

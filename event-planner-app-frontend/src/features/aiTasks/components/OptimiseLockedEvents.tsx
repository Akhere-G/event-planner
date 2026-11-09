import { format, parseISO } from "date-fns";
import { Lock, LockOpen } from "lucide-react";
import type { Event } from "../../events/types";

const dayOf = (event: Event) => event.startAt.slice(0, 10);

interface OptimiseLockedEventsProps {
  events: Event[];
  /** Every day of the trip, to number the groups. */
  days: string[];
  locked: number[];
  onToggle: (eventId: number) => void;
}

export default function OptimiseLockedEvents({
  events,
  days,
  locked,
  onToggle,
}: OptimiseLockedEventsProps) {
  const groups: { day: string; number: number; events: Event[] }[] = [];
  for (const [index, day] of days.entries()) {
    const eventsOnDay = events
      .filter((event) => dayOf(event) === day)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
    if (eventsOnDay.length > 0) {
      groups.push({ day, number: index + 1, events: eventsOnDay });
    }
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <legend className="font-semibold text-text-primary">
            Keep these exactly as they are
          </legend>
          <p className="text-sm text-text-secondary">
            Locked events won't be moved or edited.
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-surface-border bg-surface px-3 py-1 text-sm text-text-secondary">
          <Lock size={14} /> Locked: {locked.length}
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-surface-border p-3 text-sm text-text-secondary">
          There are no events on the chosen days yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border">
          {groups.map((group) => (
            <div key={group.day}>
              <p className="bg-surface-muted px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-text-secondary">
                Day {group.number} · {format(parseISO(group.day), "EEE d")}
              </p>
              <ul>
                {group.events.map((event) => {
                  const isLocked = locked.includes(event.id);
                  return (
                    <li key={event.id} className="border-t border-surface-border">
                      <label className="relative flex cursor-pointer items-center gap-3 bg-surface px-3 py-2.5 has-focus-visible:ring-2 has-focus-visible:ring-inset has-focus-visible:ring-brand-primary">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isLocked}
                          aria-label={event.name}
                          onChange={() => onToggle(event.id)}
                        />
                        <span
                          aria-hidden
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            isLocked
                              ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                              : "border-surface-border text-text-secondary"
                          }`}
                        >
                          {isLocked ? <Lock size={15} /> : <LockOpen size={15} />}
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate ${isLocked ? "font-semibold" : ""} text-text-primary`}
                        >
                          {event.name}
                        </span>
                        <span className="text-sm text-text-secondary">
                          {event.startAt.slice(11, 16)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}

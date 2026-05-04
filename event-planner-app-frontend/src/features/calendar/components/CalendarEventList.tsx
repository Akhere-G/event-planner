import { format } from "date-fns";
import { EventCard } from "../../events/components";
import type { Event } from "../../events/types";

interface CalendarEventList {
  events: Event[];
  currentDate: Date;
  setSelectedEvent: (event: Event) => void;
  setDraggedEvent: (event: Event | null) => void;
}

export default function CalendarEventList({
  events,
  currentDate,
  setDraggedEvent,
}: CalendarEventList) {
  if (events.length === 0) {
    return (
      <div className="py-10 text-center border-2 border-dashed border-surface-border md:rounded-md bg-surface">
        <p className="text-text-sub text-sm italic">
          No events on {format(currentDate, "PPPP")}.
        </p>
      </div>
    );
  }
  return (
    <>
      {events.map((event) => {
        return (
          <div
            key={event.id}
            draggable
            onDragStart={() => setDraggedEvent(event)}
            onDragEnd={() => setDraggedEvent(null)}
          >
            <EventCard event={event} />
          </div>
        );
      })}
    </>
  );
}

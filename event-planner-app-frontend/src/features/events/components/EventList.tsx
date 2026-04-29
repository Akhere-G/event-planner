import type { Event } from "../types";
import EventCard from "./EventCard";
import { StateGate } from "../../../components";
import EventActions from "./EventActions";

export default function EventList({ events }: { events: Event[] }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <StateGate
        emptyStateProps={{
          isEmpty: events.length === 0,
          height: 50,
          message: "Nothing planned yet.",
        }}
      >
        <>
          {events.map((event, i) => (
            <>
              <EventCard key={event.id} event={event} />
              {i !== events.length - 1 && (
                <EventActions from={event} to={events[i + 1]} />
              )}
            </>
          ))}
        </>
      </StateGate>
    </div>
  );
}

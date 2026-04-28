import type { Event } from "../types";
import EventCard from "./EventCard";
import { StateGate } from "../../../components";

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
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </>
      </StateGate>
    </div>
  );
}

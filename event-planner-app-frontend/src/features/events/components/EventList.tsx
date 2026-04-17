import type { Event } from "../types";
import EventCard from "./EventCard";

export default function EventList({ events }: { events: Event[] }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

import type { Event } from "../types";
import EventCard from "./EventCard";

export default function Events({ events }: { events: Event[] }) {
  console.log("evenets here:, ", events);
  return (
    <div>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

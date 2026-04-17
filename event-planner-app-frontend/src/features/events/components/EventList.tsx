import type { Event } from "../types";
import EventCard from "./EventCard";

export default function EventList({ events }: { events: Event[] }) {
  return events.map((event) => <EventCard key={event.id} event={event} />);
}

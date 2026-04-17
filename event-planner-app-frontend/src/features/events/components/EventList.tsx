import { useParams } from "react-router";
import { useDeleteEventMutation } from "../service/eventApiSlice";
import type { Event } from "../types";
import EventCard from "./EventCard";
import { isFetchBaseQueryError } from "../../api/utils";

export default function EventList({ events }: { events: Event[] }) {
  const { tripId } = useParams();
  const [deleteEvent] = useDeleteEventMutation();

  async function handleDelete(eventId: number) {
    try {
      await deleteEvent({ tripId: Number(tripId), eventId }).unwrap();
    } catch (err) {
      if (isFetchBaseQueryError(err) && err.status === 404) {
        console.log("Event not found");
        // TODO: Add toast notifcation
      }
    }
  }
  return (
    <div className="flex flex-col gap-2 mb-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} handleDelete={handleDelete} />
      ))}
    </div>
  );
}

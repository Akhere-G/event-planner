import { useParams } from "react-router";
import {
  useDeleteEventMutation,
  useUpdateEventMutation,
} from "../service/eventApiSlice";
import type { Event } from "../types";
import EventCard from "./EventCard";
import { isFetchBaseQueryError } from "../../api/utils";
import { EmptyState } from "../../../components";

export default function EventList({
  events,
  role,
}: {
  events: Event[];
  role: string;
}) {
  const { tripId } = useParams();
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();

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

  async function handleEdit(eventId: number, updatedEvent: Partial<Event>) {
    try {
      await updateEvent({
        tripId: Number(tripId),
        eventId,
        updatedEvent,
      }).unwrap();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        if (err.status === 404) {
          console.log("Event not found");
          // TODO: Add toast notifcation
        } else if (err.status === 400) {
          // TODO: Add toast notifcation
          throw err;
        }
      }
    }
  }

  let mainContent = <></>;
  if (events.length === 0) {
    mainContent = <EmptyState message="No Events." height={50} />;
  } else {
    mainContent = (
      <>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            role={role}
          />
        ))}
      </>
    );
  }
  return <div className="flex flex-col gap-2 mb-4">{mainContent}</div>;
}

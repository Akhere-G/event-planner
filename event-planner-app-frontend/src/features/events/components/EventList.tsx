import { useParams } from "react-router";
import { useDeleteEventMutation } from "../service/eventApiSlice";
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
            role={role}
          />
        ))}
      </>
    );
  }
  return <div className="flex flex-col gap-2 mb-4">{mainContent}</div>;
}

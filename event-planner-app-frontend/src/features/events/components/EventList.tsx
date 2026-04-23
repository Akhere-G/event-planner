import { useParams } from "react-router";
import type { Event } from "../types";
import EventCard from "./EventCard";
import { StateGate } from "../../../components";
import { useUpdateEvent } from "../../trips/hooks";

export default function EventList({
  events,
  role,
}: {
  events: Event[];
  role: string;
}) {
  const { tripId } = useParams();
  const { handleDelete, handleEdit } = useUpdateEvent({
    tripId: Number(tripId),
  });

  return (
    <div className="flex flex-col gap-2 mb-4">
      <StateGate
        emptyStateProps={{
          isEmpty: events.length === 0,
          height: 50,
          message: "No events on this day.",
        }}
      >
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
      </StateGate>
    </div>
  );
}

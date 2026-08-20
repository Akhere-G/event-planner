import React from "react";
import type { Event } from "../types";
import EventCard from "./EventCard";
import { StateGate } from "../../../components";
import EventActions from "./EventActions";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

export default function EventList({ events }: { events: Event[] }) {
  const selectedEvent = useSelector(
    (state: RootState) => state.map.selectedEvent,
  );

  useEffect(() => {
    if (!selectedEvent) return;
    if (!events.some((event) => event.id === selectedEvent.id)) return;

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(`event-card-${selectedEvent.id}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
    });

    return () => cancelAnimationFrame(frame);
  }, [events, selectedEvent]);

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
            <React.Fragment key={event.id}>
              <div id={`event-card-${event.id}`}>
                <EventCard event={event} />
              </div>
              {i !== events.length - 1 && (
                <EventActions from={event} to={events[i + 1]} />
              )}
            </React.Fragment>
          ))}
        </>
      </StateGate>
    </div>
  );
}

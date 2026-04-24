import { useMemo } from "react";
import type { Event } from "../types";
import { Accordion } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import { makeDays } from "../utils";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";
import { canUserEdit } from "../../users/utils";

export default function DayList({
  startDate,
  endDate,
  events,
  role,
  destination,
}: {
  events: Event[];
  startDate: string;
  endDate: string;
  role: string;
  destination: { latitude: number; longitude: number };
}) {
  const days = useMemo(
    () => makeDays(events, startDate, endDate),
    [events, startDate, endDate],
  );

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <div key={day.date} className="card p-0 ">
          <Accordion
            title={<h3 className="text-lg">{formatDateRelative(day.date)}</h3>}
            content={
              <div className="px-4 ">
                <EventList events={day.events} role={role} />
                {canUserEdit(role) && (
                  <AddEventForm date={day.date} destination={destination} />
                )}
              </div>
            }
          />
        </div>
      ))}
    </div>
  );
}

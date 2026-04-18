import { useMemo } from "react";
import type { Event } from "../types";
import { Accordion } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import { makeDays } from "../utils";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";

export default function DayList({
  startDate,
  endDate,
  events,
}: {
  events: Event[];
  startDate: string;
  endDate: string;
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
                <EventList events={day.events} />
                <AddEventForm date={day.date} />
              </div>
            }
          />
        </div>
      ))}
    </div>
  );
}

import { useMemo } from "react";
import type { Event } from "../types";
import { Accordion } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import { makeDays } from "../utils";
import EventList from "./EventList";

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
  console.log(days);

  return (
    <div>
      {days.map((day) => (
        <Accordion
          key={day.date}
          title={<h3>{formatDateRelative(day.date)}</h3>}
          content={<EventList events={day.events} />}
        />
      ))}
    </div>
  );
}

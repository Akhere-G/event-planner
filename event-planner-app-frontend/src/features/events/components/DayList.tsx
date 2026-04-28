import { useMemo } from "react";
import type { Day, Event } from "../types";
import { Accordion } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import { makeDays } from "../utils";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";
import { canUserEdit } from "../../users/utils";
import { isAfter, isBefore, isSameDay } from "date-fns";

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
  const today = new Date("2026-08-02");
  const isTripActive =
    isSameDay(today, startDate) ||
    isSameDay(today, endDate) ||
    (isAfter(today, startDate) && isBefore(today, endDate));
  const isOpen = isTripActive
    ? (_: number, day: Day) => isSameDay(day.date, today)
    : (index: number) => index == 0;

  console.log({ isTripActive });
  return (
    <div className="flex flex-col gap-4">
      {days.map((day, index) => (
        <div key={day.date} className="card p-0 ">
          <Accordion
            defaultIsOpen={isOpen(index, day)}
            TitleComponent={() => (
              <h3 className="text-lg">{formatDateRelative(day.date)}</h3>
            )}
            ContentComponent={() => (
              <div className="px-4 ">
                <EventList events={day.events} />
                {canUserEdit(role) && (
                  <AddEventForm date={day.date} destination={destination} />
                )}
              </div>
            )}
          />
        </div>
      ))}
    </div>
  );
}

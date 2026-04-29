import { useMemo } from "react";
import type { Event } from "../types";
import { Accordion } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import { makeDays } from "../utils";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";
import { canUserEdit } from "../../users/utils";
import { isAfter, isBefore, isSameDay, startOfToday } from "date-fns";

export default function DayList({
  startDate,
  endDate,
  events,
  role,
}: {
  events: Event[];
  startDate: string;
  endDate: string;
  role: string;
}) {
  const days = useMemo(
    () => makeDays(events, startDate, endDate),
    [events, startDate, endDate],
  );
  const today = useMemo(() => startOfToday(), []);

  const isTripActive = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      isSameDay(today, start) ||
      isSameDay(today, end) ||
      (isAfter(today, start) && isBefore(today, end))
    );
  }, [startDate, endDate, today]);

  const checkDefaultOpen = (index: number, dayDate: string) => {
    if (isTripActive) {
      return isSameDay(new Date(dayDate), today);
    }
    return index === 0;
  };

  return (
    <div className="flex flex-col gap-4">
      {days.map((day, index) => (
        <div key={day.date} className="card p-0 ">
          <Accordion
            defaultIsOpen={checkDefaultOpen(index, day.date)}
            TitleComponent={() => (
              <div className="flex flex-col items-start">
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-primary/80 ">
                  Day {day.day}
                </span>

                <h3 className="text-xl font-semibold tracking-tight text-text-primary">
                  {formatDateRelative(day.date)}
                </h3>
              </div>
            )}
            ContentComponent={() => (
              <div className="px-4 ">
                <EventList events={day.events} />
                {canUserEdit(role) && <AddEventForm date={day.date} />}
              </div>
            )}
          />
        </div>
      ))}
    </div>
  );
}

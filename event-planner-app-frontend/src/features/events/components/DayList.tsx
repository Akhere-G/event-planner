import { useMemo } from "react";
import type { Event } from "../types";
import { makeDays } from "../utils";
import { canUserEdit } from "../../users/utils";
import { isAfter, isBefore, isSameDay, startOfToday } from "date-fns";
import DayCard from "./DayCard";

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
          <DayCard
            defaultIsOpen={checkDefaultOpen(index, day.date)}
            day={day}
            canEdit={canUserEdit(role)}
          />
        </div>
      ))}
    </div>
  );
}

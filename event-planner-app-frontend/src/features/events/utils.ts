import { addDays, format, parseISO } from "date-fns";
import type { Event } from "./types";

export function makeDays(events: Event[], startStr: string, endStr: string) {
  function getDate(dateStr: Date | string) {
    return format(dateStr, "yyyy-MM-dd");
  }
  const startDate = parseISO(startStr);
  const endDate = parseISO(endStr);

  console.log({ startDate, endDate });

  if (endDate < startDate) return [];

  const daysLookup: Record<string, Event[]> = {};

  let current = startDate;
  while (current <= endDate) {
    daysLookup[getDate(current)] = [];
    current = addDays(current, 1);
  }

  for (const event of events) {
    const startTime = getDate(event.startTime);

    console.log(startTime, startTime in daysLookup);
    if (daysLookup[startTime]) {
      daysLookup[startTime].push(event);
    }
  }

  return Object.entries(daysLookup).map(([date, events]) => ({
    date,
    events,
  }));
}

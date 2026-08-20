import { addDays, differenceInDays, format } from "date-fns";
import type { Day, Event } from "./types";

export function makeDays(
  events: Event[],
  startStr: string,
  endStr: string,
  show = true,
  defaultOpenDate?: string,
): Day[] {
  function getDate(dateStr: Date | string) {
    return format(dateStr, "yyyy-MM-dd");
  }
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  if (endDate < startDate) return [];

  const daysLookup: Record<string, Event[]> = {};

  let current = startDate;
  while (current <= endDate) {
    daysLookup[getDate(current)] = [];
    current = addDays(current, 1);
  }

  for (const event of events) {
    const startAt = getDate(event.startAt);

    if (daysLookup[startAt]) {
      daysLookup[startAt].push(event);
    }
  }

  return Object.entries(daysLookup).map(([date, events]) => ({
    date,
    events,
    day: differenceInDays(date, startDate) + 1,
    show,
    isOpen: defaultOpenDate ? date === defaultOpenDate : false,
  }));
}

export const getDaysWithFilter = (
  events: Event[],
  startDate: string,
  endDate: string,
  defaultOpenDate?: string,
): Day[] =>
  makeDays(events, startDate, endDate, true, defaultOpenDate).map((day) => ({
    ...day,
    show: true,
  }));

export const getDayColor = (day: number) => {
  const brandPrimaries = [
    "#f97316", // Orange (Default)
    "#0ea5e9", // Sky Blue (Accent)
    "#10b981", // Emerald
    "#ef4444", // Red (Volcanic)
    "#7e22ce", // Lavender
    "#d65d0e", // Sandstone
    "#0891b2", // Arctic
    "#ac794a", // Chocolate
    "#8b828b", // Timber
    "#27ad22", // Radioactive
    "#d48f07", // Midnight Gold
  ];

  if (day >= 0 && day < brandPrimaries.length) {
    return brandPrimaries[day];
  }

  // Golden Ratio offset to ensure maximum distinction between neighbors
  const goldenRatioConjugate = 0.618033988749895;
  const hue = (day * goldenRatioConjugate * 360) % 360;

  return `hsl(${hue}, 95%, 35%)`;
};

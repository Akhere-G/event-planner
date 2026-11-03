import { addDays, format } from "date-fns";

/** "Day 2" for a zero-based offset. */
export function dayLabel(dayOffset: number) {
  return `Day ${dayOffset + 1}`;
}

export function formatTemplateTimes(startTime: string, endTime: string) {
  return `${startTime}–${endTime}`;
}

/** Local `yyyy-MM-dd` for `<input type="date">`, `daysAhead` days from today. */
export function dateInputValue(daysAhead = 0) {
  return format(addDays(new Date(), daysAhead), "yyyy-MM-dd");
}

export function durationLabel(days: number) {
  return days === 1 ? "1 day" : `${days} days`;
}

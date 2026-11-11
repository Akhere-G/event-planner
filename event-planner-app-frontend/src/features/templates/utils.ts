import { addDays, format } from "date-fns";
import type { TemplateRegion } from "./constants";

export function dayLabel(dayOffset: number) {
  return `Day ${dayOffset + 1}`;
}

export function formatTemplateTimes(startTime: string, endTime: string) {
  return `${startTime}–${endTime}`;
}

export function dateInputValue(daysAhead = 0) {
  return format(addDays(new Date(), daysAhead), "yyyy-MM-dd");
}

export function durationLabel(days: number) {
  return days === 1 ? "1 day" : `${days} days`;
}

export function toggleRegion(
  selected: TemplateRegion[],
  region: TemplateRegion,
): TemplateRegion[] {
  if (selected.includes(region)) {
    return selected.filter((current) => current !== region);
  }
  return [...selected, region];
}

import {
  format,
  isSameDay,
  isSameYear,
  isTomorrow,
  isYesterday,
} from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

export const formatDateRange = (startAt: string, endAt: string) => {
  const endDate = new Date(endAt);
  const startDate = new Date(startAt);
  const sameDay = isSameDay(endDate, startDate);
  const sameYear = isSameYear(endDate, startDate);

  let dateStr = "";

  const year = isSameYear(endDate, new Date()) ? "" : " yy";

  if (sameDay) {
    dateStr = `${format(new Date(startAt), `d MMM`)} - ${format(new Date(endAt), `d MMM${year}`)}`;
  } else if (sameYear) {
    dateStr = `${format(new Date(startAt), `d MMM`)} - ${format(new Date(endAt), `d MMM${year}`)}`;
  } else {
    dateStr = `${format(new Date(startAt), `d MMM, yy`)} - ${format(new Date(endAt), "d MMM yy")}`;
  }

  return dateStr;
};

export const formatDateRelative = (date: string | number | Date) => {
  const dateVal = new Date(date);
  const today = new Date();
  const yesterday = isYesterday(dateVal);
  const tommorrow = isTomorrow(dateVal);
  const sameDay = isSameDay(dateVal, today);
  const sameYear = isSameYear(dateVal, today);

  if (yesterday) return format(dateVal, "E dd MMM") + " (Yesterday)";
  if (sameDay) return format(dateVal, "E dd MMM") + " (Today)";
  if (tommorrow) return format(dateVal, "E dd MMM") + " (Tomorrow)";
  if (sameYear) return format(dateVal, "E dd MMM");
  return format(dateVal, "E dd MMM yyyy");
};

export const convertTripTimezoneToUtc = (
  localDateString: string,
  timeZone: string,
): string => {
  if (!localDateString || !timeZone) {
    throw new Error("Date and timezone are required");
  }

  return fromZonedTime(localDateString, timeZone).toISOString();
};

export const convertUtcToTripTimezone = (
  utcDateString: string,
  timeZone: string,
): string => {
  if (!utcDateString || !timeZone) {
    throw new Error("Date and timezone are required");
  }

  return formatInTimeZone(utcDateString, timeZone, "yyyy-MM-dd HH:mm");
};

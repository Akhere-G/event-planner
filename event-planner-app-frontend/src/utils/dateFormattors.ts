import {
  format,
  isSameDay,
  isSameYear,
  isTomorrow,
  isYesterday,
} from "date-fns";

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

  if (yesterday) return "Yesterday";
  if (sameDay) return "Today";
  if (tommorrow) return "Tomorrow";
  if (sameYear) return format(dateVal, "dd MMM");
  return format(dateVal, "dd MMM yyyy");
};

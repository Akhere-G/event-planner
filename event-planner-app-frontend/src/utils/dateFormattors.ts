import { format, isSameDay, isSameYear } from "date-fns";

export const formatDateRange = (startAt: string, endAt: string) => {
  const endDate = new Date(endAt);
  const startDate = new Date(startAt);
  const sameDay = isSameDay(endDate, startDate);
  const sameYear = isSameYear(endDate, startDate);

  let dateStr = "";

  const year = !isSameYear(startDate, new Date()) || !sameYear ? " yy" : "";

  if (sameDay) {
    dateStr = `${format(new Date(startAt), `d/MM${year}`)} - ${format(new Date(endAt), "d/MM")}`;
  } else if (sameYear) {
    dateStr = `${format(new Date(startAt), `d/MM${year}`)} - ${format(new Date(endAt), "d/MM")}`;
  } else {
    dateStr = `${format(new Date(startAt), `d/MM${year}`)} - ${format(new Date(endAt), "d/MM, yy")}`;
  }

  return dateStr;
};

export const formatDateRelative = (date = "") => {
  const dateVal = new Date(date);
  const today = new Date();
  const sameDay = isSameDay(dateVal, today);
  const sameYear = isSameYear(dateVal, today);

  if (sameDay) return format(dateVal, "p");
  if (sameYear) return format(dateVal, "dd MMM");
  return format(dateVal, "dd MMM yyyy");
};

import { addDays, format, isValid, parse } from "date-fns";

export const formatLocalDate = (date: Date) => format(date, "yyyy-MM-dd");

export const parseLocalDate = (date: string) =>
  parse(date, "yyyy-MM-dd", new Date());

export const isValidLocalDate = (date: string) => {
  const parsedDate = parseLocalDate(date);
  return isValid(parsedDate) && formatLocalDate(parsedDate) === date;
};

export const createLocalDateTime = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

export const getLocalDayRange = (date: string) => {
  const start = parseLocalDate(date);
  const end = addDays(start, 1);
  return { start, end };
};

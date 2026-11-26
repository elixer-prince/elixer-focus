import { format } from "date-fns";
import {
  createLocalDateTime,
  getLocalDayRange,
  isValidLocalDate,
} from "@/features/calendar/utils/calendar-date";
import type { ScheduledOccurrence } from "@/features/calendar/types/calendar";

type OccurrenceInterval = {
  occurrence: ScheduledOccurrence;
  start: Date;
  end: Date;
};

export type CalendarOverlapWarning = {
  occurrenceId: string;
  title: string;
  durationMinutes: number;
  conflictingTitles: string[];
  suggestedStartTime?: string;
};

const isValidLocalTime = (time: string) => {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [hours, minutes] = time.split(":").map(Number);
  return hours <= 23 && minutes <= 59;
};

export const getOccurrenceTimeRange = (occurrence: ScheduledOccurrence) => {
  if (!occurrence.startTime || !isValidLocalTime(occurrence.startTime)) {
    return undefined;
  }

  const durationMinutes = occurrence.durationMinutes ?? 30;
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 1440
  ) {
    return undefined;
  }

  if (!isValidLocalDate(occurrence.date)) return undefined;
  const start = createLocalDateTime(occurrence.date, occurrence.startTime);
  if (Number.isNaN(start.getTime())) return undefined;

  return {
    start,
    end: new Date(start.getTime() + durationMinutes * 60_000),
  };
};

const getOccurrenceIntervals = (occurrences: ScheduledOccurrence[]) =>
  occurrences.flatMap((occurrence): OccurrenceInterval[] => {
    if (occurrence.isSkipped) return [];
    const timeRange = getOccurrenceTimeRange(occurrence);
    return timeRange ? [{ occurrence, ...timeRange }] : [];
  });

const intervalsOverlap = (
  first: Pick<OccurrenceInterval, "start" | "end">,
  second: Pick<OccurrenceInterval, "start" | "end">,
) => first.start < second.end && first.end > second.start;

const findNextAvailableStart = (
  intervals: OccurrenceInterval[],
  occurrence: OccurrenceInterval,
  selectedDate: string,
) => {
  const { start: dayStart, end: dayEnd } = getLocalDayRange(selectedDate);
  const duration = occurrence.end.getTime() - occurrence.start.getTime();
  let candidate = new Date(
    Math.max(occurrence.start.getTime(), dayStart.getTime()),
  );

  while (candidate < dayEnd) {
    const candidateEnd = new Date(candidate.getTime() + duration);
    const conflicts = intervals.filter(
      (interval) =>
        interval.occurrence.id !== occurrence.occurrence.id &&
        candidate < interval.end &&
        candidateEnd > interval.start,
    );

    if (!conflicts.length) return format(candidate, "HH:mm");

    candidate = new Date(
      Math.max(...conflicts.map((interval) => interval.end.getTime())),
    );
  }

  return undefined;
};

export const getOverlappingOccurrenceIds = (
  occurrences: ScheduledOccurrence[],
) => {
  const intervals = getOccurrenceIntervals(occurrences);
  const overlappingIds = new Set<string>();

  intervals.forEach((interval, index) => {
    for (
      let otherIndex = index + 1;
      otherIndex < intervals.length;
      otherIndex++
    ) {
      const other = intervals[otherIndex];
      if (!intervalsOverlap(interval, other)) continue;
      overlappingIds.add(interval.occurrence.id);
      overlappingIds.add(other.occurrence.id);
    }
  });

  return overlappingIds;
};

export const getCalendarOverlapWarnings = (
  occurrences: ScheduledOccurrence[],
  selectedDate: string,
): CalendarOverlapWarning[] => {
  const intervals = getOccurrenceIntervals(occurrences);
  const { start: dayStart, end: dayEnd } = getLocalDayRange(selectedDate);

  return intervals.flatMap((interval) => {
    if (interval.start >= dayEnd || interval.end <= dayStart) return [];

    const conflicts = intervals.filter(
      (other) =>
        other.occurrence.id !== interval.occurrence.id &&
        intervalsOverlap(interval, other),
    );
    if (!conflicts.length) return [];

    return [
      {
        occurrenceId: interval.occurrence.id,
        title: interval.occurrence.title,
        durationMinutes: Math.round(
          (interval.end.getTime() - interval.start.getTime()) / 60_000,
        ),
        conflictingTitles: [
          ...new Set(conflicts.map(({ occurrence: other }) => other.title)),
        ],
        suggestedStartTime: findNextAvailableStart(
          intervals,
          interval,
          selectedDate,
        ),
      },
    ];
  });
};

import type { TrackedInterval } from "@/features/countdown-timer/types/tracked-interval";
import {
  createLocalDateTime,
  formatLocalDate,
  getLocalDayRange,
  isValidLocalDate,
  parseLocalDate,
} from "@/features/calendar/utils/calendar-date";
import type {
  ActualSleepEvent,
  ActualSleepRecord,
  AwakeIdleTotal,
  AwakeWindowSegment,
  PlannedSleepEvent,
  SleepProgressSegment,
  SleepScheduleSettings,
} from "@/features/sleep-schedule/types/sleep-schedule";
import { addDays } from "date-fns";

const MINUTE_IN_MILLISECONDS = 60_000;

export const isValidClockValue = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

export const isValidSleepDuration = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 60 &&
  value <= 960 &&
  (value - 60) % 15 === 0;

export const isValidSleepScheduleSettings = (
  value: unknown,
): value is SleepScheduleSettings => {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<SleepScheduleSettings>;
  if (!isValidSleepDuration(settings.targetSleepDurationMinutes)) return false;
  if (settings.wakeTime !== null && !isValidClockValue(settings.wakeTime)) {
    return false;
  }
  if (
    settings.bedTimeOverride !== null &&
    !isValidClockValue(settings.bedTimeOverride)
  ) {
    return false;
  }

  return settings.wakeTime !== null || settings.bedTimeOverride === null;
};

export type DailySleepPlan = {
  wakeAt: number;
  bedAt: number;
  nextWakeAt: number;
  plannedSleepDurationMinutes: number;
  hasBedTimeOverride: boolean;
};

export const getDailySleepPlan = (
  settings: unknown,
  wakeDate: string,
): DailySleepPlan | null => {
  if (!isValidSleepScheduleSettings(settings) || !settings.wakeTime) {
    return null;
  }
  if (!isValidLocalDate(wakeDate)) return null;

  const nextWakeDate = formatLocalDate(addDays(parseLocalDate(wakeDate), 1));
  const wakeAt = createLocalDateTime(wakeDate, settings.wakeTime).getTime();
  const nextWakeAt = createLocalDateTime(
    nextWakeDate,
    settings.wakeTime,
  ).getTime();

  if (!Number.isFinite(wakeAt) || !Number.isFinite(nextWakeAt)) return null;

  let bedAt: number;
  if (settings.bedTimeOverride) {
    const sameDayBedAt = createLocalDateTime(
      wakeDate,
      settings.bedTimeOverride,
    ).getTime();
    bedAt =
      sameDayBedAt > wakeAt
        ? sameDayBedAt
        : createLocalDateTime(nextWakeDate, settings.bedTimeOverride).getTime();
  } else {
    bedAt =
      nextWakeAt - settings.targetSleepDurationMinutes * MINUTE_IN_MILLISECONDS;
  }

  if (!Number.isFinite(bedAt) || bedAt <= wakeAt) return null;

  return {
    wakeAt,
    bedAt,
    nextWakeAt,
    plannedSleepDurationMinutes: Math.round(
      (nextWakeAt - bedAt) / MINUTE_IN_MILLISECONDS,
    ),
    hasBedTimeOverride: settings.bedTimeOverride !== null,
  };
};

const isDateInRange = (date: string, startDate: string, endDate: string) =>
  date >= startDate && date <= endDate;

const getPreviousLocalDate = (date: string) =>
  formatLocalDate(addDays(parseLocalDate(date), -1));

const getNextLocalDate = (date: string) =>
  formatLocalDate(addDays(parseLocalDate(date), 1));

export const getPlannedSleepEvents = (
  settings: unknown,
  startDate: string,
  endDate: string,
): PlannedSleepEvent[] => {
  if (
    !isValidLocalDate(startDate) ||
    !isValidLocalDate(endDate) ||
    startDate > endDate
  ) {
    return [];
  }

  const events: PlannedSleepEvent[] = [];
  let wakeDate = getPreviousLocalDate(startDate);

  while (wakeDate <= endDate) {
    const plan = getDailySleepPlan(settings, wakeDate);
    if (plan) {
      const wakeEventDate = formatLocalDate(new Date(plan.wakeAt));
      const bedEventDate = formatLocalDate(new Date(plan.bedAt));

      if (isDateInRange(wakeEventDate, startDate, endDate)) {
        events.push({
          id: `planned-wake-${wakeDate}`,
          type: "wake",
          at: plan.wakeAt,
          date: wakeEventDate,
        });
      }
      if (isDateInRange(bedEventDate, startDate, endDate)) {
        events.push({
          id: `planned-bed-${wakeDate}`,
          type: "bed",
          at: plan.bedAt,
          date: bedEventDate,
        });
      }
    }
    wakeDate = getNextLocalDate(wakeDate);
  }

  return events.sort((left, right) => left.at - right.at);
};

export const getAwakeWindowSegments = (
  settings: unknown,
  startDate: string,
  endDate: string,
): AwakeWindowSegment[] => {
  if (
    !isValidLocalDate(startDate) ||
    !isValidLocalDate(endDate) ||
    startDate > endDate
  ) {
    return [];
  }

  const segments: AwakeWindowSegment[] = [];
  let wakeDate = getPreviousLocalDate(startDate);

  while (wakeDate <= endDate) {
    const plan = getDailySleepPlan(settings, wakeDate);
    if (plan) {
      let segmentStart = plan.wakeAt;
      while (segmentStart < plan.bedAt) {
        const date = formatLocalDate(new Date(segmentStart));
        const dayEnd = getLocalDayRange(date).end.getTime();
        const segmentEnd = Math.min(plan.bedAt, dayEnd);

        if (
          segmentEnd > segmentStart &&
          isDateInRange(date, startDate, endDate)
        ) {
          segments.push({ date, startAt: segmentStart, endAt: segmentEnd });
        }
        segmentStart = segmentEnd;
      }
    }
    wakeDate = getNextLocalDate(wakeDate);
  }

  return segments.sort((left, right) => left.startAt - right.startAt);
};

export const getSleepProgressSegments = (
  settings: unknown,
  startDate: string,
  endDate: string,
  now: number,
): SleepProgressSegment[] => {
  const today = formatLocalDate(new Date(now));
  return getAwakeWindowSegments(settings, startDate, endDate).flatMap(
    (segment) => {
      if (segment.date < today) return [{ ...segment, filled: true }];
      if (segment.date > today || now <= segment.startAt) {
        return [{ ...segment, filled: false }];
      }
      if (now >= segment.endAt) return [{ ...segment, filled: true }];

      return [
        { ...segment, endAt: now, filled: true },
        { ...segment, startAt: now, filled: false },
      ];
    },
  );
};

export const isValidActualSleepRecord = (
  value: unknown,
): value is ActualSleepRecord => {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<ActualSleepRecord>;
  return (
    typeof record.id === "string" &&
    record.id.length > 0 &&
    typeof record.sleepDate === "string" &&
    isValidLocalDate(record.sleepDate) &&
    typeof record.bedAt === "number" &&
    Number.isFinite(record.bedAt) &&
    (record.wakeAt === null ||
      (typeof record.wakeAt === "number" &&
        Number.isFinite(record.wakeAt) &&
        record.wakeAt > record.bedAt))
  );
};

export const getActualSleepEvents = (
  records: unknown,
  startDate: string,
  endDate: string,
): ActualSleepEvent[] => {
  if (
    !Array.isArray(records) ||
    !isValidLocalDate(startDate) ||
    !isValidLocalDate(endDate) ||
    startDate > endDate
  ) {
    return [];
  }

  return records
    .filter(isValidActualSleepRecord)
    .flatMap((record) =>
      (
        [
          { type: "bed" as const, at: record.bedAt },
          ...(record.wakeAt === null
            ? []
            : [{ type: "wake" as const, at: record.wakeAt }]),
        ] as const
      ).flatMap(({ type, at }) => {
        const date = formatLocalDate(new Date(at));
        return isDateInRange(date, startDate, endDate)
          ? [
              {
                id: `actual-${type}-${record.id}`,
                recordId: record.id,
                type,
                at,
                date,
              },
            ]
          : [];
      }),
    )
    .sort((left, right) => left.at - right.at);
};

export const getActualSleepRecordsForDate = (
  records: unknown,
  date: string,
): ActualSleepRecord[] => {
  if (!Array.isArray(records) || !isValidLocalDate(date)) return [];

  return records.filter(
    (record): record is ActualSleepRecord =>
      isValidActualSleepRecord(record) &&
      (formatLocalDate(new Date(record.bedAt)) === date ||
        (record.wakeAt !== null &&
          formatLocalDate(new Date(record.wakeAt)) === date)),
  );
};

export const getMostRecentIncompleteSleepRecord = (
  records: unknown,
  before: number,
): ActualSleepRecord | undefined => {
  if (!Array.isArray(records) || !Number.isFinite(before)) return undefined;

  return records
    .filter(
      (record): record is ActualSleepRecord =>
        isValidActualSleepRecord(record) &&
        record.wakeAt === null &&
        record.bedAt < before,
    )
    .sort((left, right) => right.bedAt - left.bedAt)[0];
};

export const getAwakeIdleTotals = (
  settings: unknown,
  intervals: TrackedInterval[],
  startDate: string,
  endDate: string,
  now: number,
): AwakeIdleTotal[] => {
  if (
    !isValidLocalDate(startDate) ||
    !isValidLocalDate(endDate) ||
    startDate > endDate
  ) {
    return [];
  }

  const dates: string[] = [];
  let date = startDate;
  while (date <= endDate) {
    dates.push(date);
    date = getNextLocalDate(date);
  }

  if (!isValidSleepScheduleSettings(settings) || !settings.wakeTime) {
    return dates.map((item) => ({ date: item, idleSeconds: null }));
  }

  const segmentsByDate = new Map<string, AwakeWindowSegment[]>();
  getAwakeWindowSegments(settings, startDate, endDate).forEach((segment) => {
    const segments = segmentsByDate.get(segment.date) ?? [];
    segments.push(segment);
    segmentsByDate.set(segment.date, segments);
  });

  return dates.map((item) => {
    const totalMilliseconds = intervals
      .filter((interval) => interval.kind === "idle")
      .reduce((total, interval) => {
        const intervalEnd = interval.endedAt ?? now;
        const overlap = (segmentsByDate.get(item) ?? []).reduce(
          (seconds, segment) => {
            const start = Math.max(interval.startedAt, segment.startAt);
            const end = Math.min(intervalEnd, segment.endAt);
            return seconds + Math.max(0, end - start);
          },
          0,
        );
        return total + overlap;
      }, 0);

    return {
      date: item,
      idleSeconds: Math.floor(totalMilliseconds / 1000),
    };
  });
};

export const formatSleepDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  if (!remainingMinutes) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
};

export const formatAwakeDuration = (seconds: number) =>
  formatSleepDuration(Math.floor(seconds / 60));

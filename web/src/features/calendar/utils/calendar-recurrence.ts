import { RRule, type Weekday } from "rrule";
import type {
  RecurrenceRuleDraft,
  RecurrenceRuleSegment,
  RecurrenceSeries,
} from "@/features/calendar/types/calendar";
import { isValidLocalDate } from "@/features/calendar/utils/calendar-date";

const ruleWeekdays: Weekday[] = [
  RRule.SU,
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
];

const toUtcDate = (date: string) => new Date(`${date}T00:00:00.000Z`);

const formatUtcDate = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const isValidTime = (time: string) => {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [hours, minutes] = time.split(":").map(Number);
  return hours <= 23 && minutes <= 59;
};

export const validateRecurrenceRule = (
  rule: RecurrenceRuleDraft,
  effectiveFrom: string,
) => {
  if (!isValidLocalDate(effectiveFrom)) {
    throw new Error("Choose a valid recurrence start date.");
  }
  if (!Number.isInteger(rule.interval) || rule.interval < 1) {
    throw new Error("Repeat interval must be at least one.");
  }
  if (rule.frequency === "weekly") {
    if (
      !rule.weekdays?.length ||
      rule.weekdays.some(
        (weekday) => !Number.isInteger(weekday) || weekday < 0 || weekday > 6,
      )
    ) {
      throw new Error("Choose at least one valid weekday.");
    }
  }
  if (rule.frequency === "monthly") {
    if (rule.monthlyMode === "dayOfMonth") {
      if (
        !rule.monthDay ||
        !Number.isInteger(rule.monthDay) ||
        rule.monthDay < 1 ||
        rule.monthDay > 31
      ) {
        throw new Error("Choose a valid day of the month.");
      }
    } else {
      const validOrdinal =
        rule.weekdayOrdinal === "last" ||
        (typeof rule.weekdayOrdinal === "number" &&
          Number.isInteger(rule.weekdayOrdinal) &&
          rule.weekdayOrdinal >= 1 &&
          rule.weekdayOrdinal <= 5);
      if (
        rule.monthlyMode !== "weekdayOrdinal" ||
        !Number.isInteger(rule.weekday) ||
        rule.weekday! < 0 ||
        rule.weekday! > 6 ||
        !validOrdinal
      ) {
        throw new Error("Choose a valid monthly pattern.");
      }
    }
  }
  if (rule.startTime !== undefined && !isValidTime(rule.startTime)) {
    throw new Error("Choose a valid start time.");
  }
  if (rule.startTime === undefined && rule.durationMinutes !== undefined) {
    throw new Error("An untimed recurrence cannot have a duration.");
  }
  if (
    rule.durationMinutes !== undefined &&
    (!Number.isInteger(rule.durationMinutes) ||
      rule.durationMinutes < 1 ||
      rule.durationMinutes > 1440)
  ) {
    throw new Error("Duration must be between 1 and 1440 minutes.");
  }
  if (rule.endDate !== undefined && !isValidLocalDate(rule.endDate)) {
    throw new Error("Choose a valid recurrence end date.");
  }
  if (
    rule.occurrenceCount !== undefined &&
    (!Number.isInteger(rule.occurrenceCount) || rule.occurrenceCount < 1)
  ) {
    throw new Error("Occurrence count must be at least one.");
  }
  if (rule.endDate !== undefined && rule.occurrenceCount !== undefined) {
    throw new Error("Choose an end date or an occurrence count, not both.");
  }
};

const createRule = (
  series: RecurrenceSeries,
  segment: RecurrenceRuleSegment,
) => {
  validateRecurrenceRule(segment, segment.effectiveFrom);
  const weeklyAnchor = toUtcDate(series.startDate);
  const options: ConstructorParameters<typeof RRule>[0] = {
    freq:
      segment.frequency === "daily"
        ? RRule.DAILY
        : segment.frequency === "weekly"
          ? RRule.WEEKLY
          : RRule.MONTHLY,
    interval: segment.interval,
    dtstart:
      segment.frequency === "weekly"
        ? weeklyAnchor
        : toUtcDate(segment.effectiveFrom),
  };

  if (segment.frequency === "weekly") {
    options.wkst = ruleWeekdays[weeklyAnchor.getUTCDay()];
    options.byweekday = [...new Set(segment.weekdays)].map(
      (weekday) => ruleWeekdays[weekday],
    );
  } else if (segment.frequency === "monthly") {
    if (segment.monthlyMode === "dayOfMonth") {
      options.bymonthday = segment.monthDay;
    } else {
      const ordinal =
        segment.weekdayOrdinal === "last" ? -1 : segment.weekdayOrdinal!;
      options.byweekday = ruleWeekdays[segment.weekday!].nth(ordinal);
    }
  }

  return new RRule(options);
};

export const getRecurrenceDatesInRange = (
  series: RecurrenceSeries,
  segment: RecurrenceRuleSegment,
  rangeStart: string,
  rangeEnd: string,
) => {
  if (!isValidLocalDate(series.startDate)) {
    throw new Error("Choose a valid series start date.");
  }
  if (!isValidLocalDate(rangeStart) || !isValidLocalDate(rangeEnd)) {
    throw new Error("Choose a valid calendar date range.");
  }
  if (
    segment.seriesId !== series.id ||
    !isValidLocalDate(segment.effectiveFrom) ||
    (segment.effectiveThrough !== undefined &&
      !isValidLocalDate(segment.effectiveThrough)) ||
    (segment.effectiveThrough !== undefined &&
      segment.effectiveThrough < segment.effectiveFrom)
  ) {
    throw new Error("Choose a valid recurrence segment.");
  }
  if (rangeStart > rangeEnd || !series.isActive) return [];

  const upperBound = [rangeEnd, segment.effectiveThrough, segment.endDate]
    .filter((date): date is string => date !== undefined)
    .sort()[0];
  if (upperBound < segment.effectiveFrom) return [];

  const rule = createRule(series, segment);
  const anchor =
    segment.frequency === "weekly" ? series.startDate : segment.effectiveFrom;
  const needsCount = segment.occurrenceCount !== undefined;
  const lowerBound = needsCount
    ? anchor
    : [anchor, segment.effectiveFrom, rangeStart].sort().at(-1)!;
  const candidates = rule
    .between(toUtcDate(lowerBound), toUtcDate(upperBound), true)
    .map(formatUtcDate)
    .filter((date) => date >= segment.effectiveFrom);
  const limitedCandidates = needsCount
    ? candidates.slice(0, segment.occurrenceCount)
    : candidates;

  return limitedCandidates.filter(
    (date) =>
      date >= rangeStart &&
      date <= rangeEnd &&
      date <= (segment.effectiveThrough ?? rangeEnd) &&
      date <= (segment.endDate ?? rangeEnd),
  );
};

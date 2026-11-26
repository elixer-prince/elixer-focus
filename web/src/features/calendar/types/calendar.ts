import type { TaskCategory } from "@/features/tasks/types/task";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly";

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const isWeekStartsOn = (value: unknown): value is WeekStartsOn =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 6;

export type RecurrenceSeries = {
  id: string;
  taskId: string;
  startDate: string;
  isActive: boolean;
};

export type RecurrenceRuleSegment = {
  id: string;
  seriesId: string;
  effectiveFrom: string;
  effectiveThrough?: string;
  frequency: RecurrenceFrequency;
  interval: number;
  weekdays?: number[];
  monthlyMode?: "dayOfMonth" | "weekdayOrdinal";
  monthDay?: number;
  weekday?: number;
  weekdayOrdinal?: 1 | 2 | 3 | 4 | 5 | "last";
  startTime?: string;
  durationMinutes?: number;
  endDate?: string;
  occurrenceCount?: number;
};

export type RecurrenceRuleDraft = Omit<
  RecurrenceRuleSegment,
  "id" | "seriesId" | "effectiveFrom" | "effectiveThrough"
>;

export type ScheduledOccurrence = {
  id: string;
  taskId: string;
  seriesId?: string;
  segmentId?: string;
  date: string;
  startTime?: string;
  durationMinutes?: number;
  title: string;
  description?: string;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: number;
  isSkipped: boolean;
};

export type SleepEventRecord = {
  id: string;
  date: string;
  type: "wake" | "bed";
  actualAt: number;
};

export type CalendarData = {
  recurrenceSeries: RecurrenceSeries[];
  recurrenceRuleSegments: RecurrenceRuleSegment[];
  scheduledOccurrences: ScheduledOccurrence[];
  sleepEventRecords: SleepEventRecord[];
  weekStartsOn: WeekStartsOn;
};

export const initialCalendarData: CalendarData = {
  recurrenceSeries: [],
  recurrenceRuleSegments: [],
  scheduledOccurrences: [],
  sleepEventRecords: [],
  weekStartsOn: 0,
};

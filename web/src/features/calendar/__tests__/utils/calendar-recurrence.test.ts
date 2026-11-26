import { getRecurrenceDatesInRange } from "@/features/calendar/utils/calendar-recurrence";
import type {
  RecurrenceRuleSegment,
  RecurrenceSeries,
} from "@/features/calendar/types/calendar";

const series: RecurrenceSeries = {
  id: "series-1",
  taskId: "task-1",
  startDate: "2026-01-07",
  isActive: true,
};

const createSegment = (
  overrides: Partial<RecurrenceRuleSegment> = {},
): RecurrenceRuleSegment => ({
  id: "segment-1",
  seriesId: series.id,
  effectiveFrom: series.startDate,
  frequency: "daily",
  interval: 1,
  ...overrides,
});

describe("calendar recurrence dates", () => {
  it("anchors weekly intervals to the original series start date", () => {
    const segment = createSegment({
      effectiveFrom: "2026-01-10",
      frequency: "weekly",
      interval: 2,
      weekdays: [1],
    });

    expect(
      getRecurrenceDatesInRange(series, segment, "2026-01-10", "2026-02-10"),
    ).toEqual(["2026-01-12", "2026-01-26", "2026-02-09"]);
  });

  it("skips months without a matching day of month", () => {
    const segment = createSegment({
      effectiveFrom: "2026-01-31",
      frequency: "monthly",
      monthlyMode: "dayOfMonth",
      monthDay: 31,
    });

    expect(
      getRecurrenceDatesInRange(series, segment, "2026-01-01", "2026-04-30"),
    ).toEqual(["2026-01-31", "2026-03-31"]);
  });

  it("supports the last weekday ordinal of each month", () => {
    const segment = createSegment({
      effectiveFrom: "2026-01-01",
      frequency: "monthly",
      monthlyMode: "weekdayOrdinal",
      weekday: 5,
      weekdayOrdinal: "last",
    });

    expect(
      getRecurrenceDatesInRange(series, segment, "2026-01-01", "2026-03-31"),
    ).toEqual(["2026-01-30", "2026-02-27", "2026-03-27"]);
  });

  it("counts only occurrences in a dated segment", () => {
    const segment = createSegment({
      effectiveFrom: "2026-01-10",
      frequency: "daily",
      interval: 1,
      occurrenceCount: 2,
    });

    expect(
      getRecurrenceDatesInRange(series, segment, "2026-01-01", "2026-01-20"),
    ).toEqual(["2026-01-10", "2026-01-11"]);
  });
});

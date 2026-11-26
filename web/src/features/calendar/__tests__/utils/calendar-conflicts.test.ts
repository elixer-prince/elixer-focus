import {
  getCalendarOverlapWarnings,
  getOccurrenceTimeRange,
} from "@/features/calendar/utils/calendar-conflicts";
import type { ScheduledOccurrence } from "@/features/calendar/types/calendar";
import type { TaskCategory } from "@/features/tasks/types/task";

const createOccurrence = (
  id: string,
  date: string,
  startTime: string,
  durationMinutes: number,
  title = id,
): ScheduledOccurrence => ({
  id,
  taskId: `task-${id}`,
  date,
  startTime,
  durationMinutes,
  title,
  category: "uncategorised" as TaskCategory,
  isCompleted: false,
  isSkipped: false,
});

describe("calendar overlap warnings", () => {
  it("finds overlapping intervals and suggests the next available time", () => {
    const warnings = getCalendarOverlapWarnings(
      [
        createOccurrence("first", "2026-11-25", "09:00", 60, "First task"),
        createOccurrence("second", "2026-11-25", "09:30", 60, "Second task"),
      ],
      "2026-11-25",
    );

    expect(warnings).toEqual([
      {
        occurrenceId: "first",
        title: "First task",
        durationMinutes: 60,
        conflictingTitles: ["Second task"],
        suggestedStartTime: "10:30",
      },
      {
        occurrenceId: "second",
        title: "Second task",
        durationMinutes: 60,
        conflictingTitles: ["First task"],
        suggestedStartTime: "10:00",
      },
    ]);
  });

  it("compares intervals across midnight, including one starting the prior day", () => {
    const warnings = getCalendarOverlapWarnings(
      [
        createOccurrence("overnight", "2026-11-24", "23:30", 60),
        createOccurrence("early", "2026-11-25", "00:00", 30),
      ],
      "2026-11-25",
    );

    expect(warnings).toMatchObject([
      {
        occurrenceId: "overnight",
        conflictingTitles: ["early"],
        suggestedStartTime: "00:30",
      },
      {
        occurrenceId: "early",
        conflictingTitles: ["overnight"],
        suggestedStartTime: "00:30",
      },
    ]);
  });

  it("does not report adjacent intervals as overlapping", () => {
    const warnings = getCalendarOverlapWarnings(
      [
        createOccurrence("first", "2026-11-25", "09:00", 60),
        createOccurrence("second", "2026-11-25", "10:00", 30),
      ],
      "2026-11-25",
    );

    expect(warnings).toEqual([]);
  });

  it("keeps the warning when no available slot fits on the selected date", () => {
    const warnings = getCalendarOverlapWarnings(
      [
        createOccurrence("requested", "2026-11-25", "09:00", 60),
        createOccurrence("all-day", "2026-11-25", "00:00", 1440),
      ],
      "2026-11-25",
    );

    expect(
      warnings.find(({ occurrenceId }) => occurrenceId === "requested")
        ?.suggestedStartTime,
    ).toBeUndefined();
  });

  it("ignores untimed, skipped, and invalid occurrences", () => {
    const untimed = {
      ...createOccurrence("untimed", "2026-11-25", "09:00", 30),
      startTime: undefined,
    };
    const skipped = {
      ...createOccurrence("skipped", "2026-11-25", "09:00", 30),
      isSkipped: true,
    };
    const invalid = createOccurrence("invalid", "2026-11-25", "25:00", 30);

    expect(getOccurrenceTimeRange(untimed)).toBeUndefined();
    expect(
      getCalendarOverlapWarnings([skipped, invalid], "2026-11-25"),
    ).toEqual([]);
  });
});

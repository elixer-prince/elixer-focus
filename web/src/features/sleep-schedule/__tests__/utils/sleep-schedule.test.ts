import type { TrackedInterval } from "@/features/countdown-timer/types/tracked-interval";
import {
  getActualSleepEvents,
  getAwakeIdleTotals,
  getDailySleepPlan,
  getPlannedSleepEvents,
  getSleepProgressSegments,
  isValidSleepScheduleSettings,
} from "@/features/sleep-schedule/utils/sleep-schedule";
import type { SleepScheduleSettings } from "@/features/sleep-schedule/types/sleep-schedule";

const settings: SleepScheduleSettings = {
  wakeTime: "07:00",
  targetSleepDurationMinutes: 480,
  bedTimeOverride: null,
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Sleep Schedule calculations", () => {
  it("validates the target duration and schedule clock values", () => {
    expect(isValidSleepScheduleSettings(settings)).toBe(true);
    expect(
      isValidSleepScheduleSettings({
        ...settings,
        targetSleepDurationMinutes: 485,
      }),
    ).toBe(false);
    expect(
      isValidSleepScheduleSettings({
        ...settings,
        wakeTime: "25:00",
      }),
    ).toBe(false);
    expect(
      isValidSleepScheduleSettings({
        ...settings,
        wakeTime: null,
        bedTimeOverride: "22:00",
      }),
    ).toBe(false);
  });

  it("calculates automatic bedtime from the next wake by elapsed duration", () => {
    const plan = getDailySleepPlan(settings, "2026-11-25");

    expect(plan).not.toBeNull();
    expect(new Date(plan!.wakeAt).getHours()).toBe(7);
    expect(new Date(plan!.bedAt).getHours()).toBe(23);
    expect(plan!.plannedSleepDurationMinutes).toBe(480);
    expect(plan!.hasBedTimeOverride).toBe(false);
  });

  it("places an earlier or equal override after the wake on the next date", () => {
    const plan = getDailySleepPlan(
      { ...settings, bedTimeOverride: "07:00" },
      "2026-11-25",
    );

    expect(plan).not.toBeNull();
    expect(new Date(plan!.bedAt).getDate()).toBe(26);
    expect(plan!.plannedSleepDurationMinutes).toBe(0);
    expect(plan!.hasBedTimeOverride).toBe(true);
  });

  it("derives planned events and splits awake windows at local midnight", () => {
    const extendedAwakePlan = {
      ...settings,
      targetSleepDurationMinutes: 60,
    };
    const events = getPlannedSleepEvents(
      extendedAwakePlan,
      "2026-11-25",
      "2026-11-26",
    );
    const segments = getSleepProgressSegments(
      extendedAwakePlan,
      "2026-11-25",
      "2026-11-26",
      new Date(2026, 10, 25, 12).getTime(),
    );

    expect(events.map(({ type, date }) => `${type}:${date}`)).toEqual([
      "bed:2026-11-25",
      "wake:2026-11-25",
      "bed:2026-11-26",
      "wake:2026-11-26",
    ]);
    expect(segments.some((segment) => segment.date === "2026-11-25")).toBe(
      true,
    );
    expect(segments.some((segment) => segment.date === "2026-11-26")).toBe(
      true,
    );
    expect(segments.filter((segment) => segment.date === "2026-11-25")).toEqual(
      expect.arrayContaining([expect.objectContaining({ filled: true })]),
    );
  });

  it("uses local time compatible resolution for daylight saving gaps and folds", () => {
    vi.stubEnv("TZ", "America/New_York");

    const skipped = getDailySleepPlan(
      { ...settings, wakeTime: "02:30" },
      "2026-03-08",
    );
    const repeated = getDailySleepPlan(
      { ...settings, wakeTime: "01:30" },
      "2026-11-01",
    );

    expect(new Date(skipped!.wakeAt).getHours()).toBe(3);
    expect(new Date(skipped!.wakeAt).getMinutes()).toBe(30);
    expect(new Date(repeated!.wakeAt).getTimezoneOffset()).toBe(240);
    expect(skipped!.plannedSleepDurationMinutes).toBe(480);
    expect(repeated!.plannedSleepDurationMinutes).toBe(480);
  });

  it("intersects idle intervals with awake windows, splits dates, and ends open intervals at now", () => {
    const idleIntervals: TrackedInterval[] = [
      {
        id: "idle-crossing-midnight",
        kind: "idle",
        startedAt: new Date(2026, 10, 25, 23).getTime(),
        endedAt: new Date(2026, 10, 26, 2).getTime(),
        sessionId: null,
        userId: null,
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: "open-idle",
        kind: "idle",
        startedAt: new Date(2026, 10, 26, 3).getTime(),
        endedAt: null,
        sessionId: null,
        userId: null,
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: "overrun",
        kind: "overrun",
        startedAt: new Date(2026, 10, 26, 3).getTime(),
        endedAt: null,
        sessionId: "session-1",
        userId: null,
        createdAt: 0,
        updatedAt: 0,
      },
    ];
    const now = new Date(2026, 10, 26, 4).getTime();
    const totals = getAwakeIdleTotals(
      { ...settings, targetSleepDurationMinutes: 60 },
      idleIntervals,
      "2026-11-25",
      "2026-11-26",
      now,
    );

    expect(totals).toEqual([
      { date: "2026-11-25", idleSeconds: 3600 },
      { date: "2026-11-26", idleSeconds: 3 * 60 * 60 },
    ]);
  });

  it("returns unavailable totals and no events for an unconfigured plan", () => {
    expect(
      getPlannedSleepEvents(settings, "2026-11-25", "2026-11-25"),
    ).toHaveLength(2);
    expect(
      getAwakeIdleTotals(
        { ...settings, wakeTime: null },
        [],
        "2026-11-25",
        "2026-11-25",
        Date.now(),
      ),
    ).toEqual([{ date: "2026-11-25", idleSeconds: null }]);
  });

  it("renders actual sleep events on their current local dates", () => {
    const bedAt = new Date(2026, 10, 25, 23).getTime();
    const wakeAt = new Date(2026, 10, 26, 7).getTime();

    expect(
      getActualSleepEvents(
        [{ id: "night-1", sleepDate: "2026-11-25", bedAt, wakeAt }],
        "2026-11-26",
        "2026-11-26",
      ),
    ).toEqual([expect.objectContaining({ type: "wake", date: "2026-11-26" })]);
  });
});

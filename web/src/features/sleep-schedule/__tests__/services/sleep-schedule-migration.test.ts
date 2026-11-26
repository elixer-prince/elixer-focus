import { initialSleepScheduleData } from "@/features/sleep-schedule/types/sleep-schedule";
import { migrateLegacySleepEvents } from "@/features/sleep-schedule/services/sleep-schedule-migration";

describe("Sleep Schedule legacy event migration", () => {
  const now = new Date(2026, 10, 27, 12).getTime();

  it("pairs each wake with the nearest earlier unpaired bed by timestamp", () => {
    const firstBedAt = new Date(2026, 10, 24, 22).getTime();
    const secondBedAt = new Date(2026, 10, 25, 23).getTime();
    const firstWakeAt = new Date(2026, 10, 25, 7).getTime();
    const secondWakeAt = new Date(2026, 10, 26, 7).getTime();

    const result = migrateLegacySleepEvents(
      initialSleepScheduleData,
      [
        { id: "bed-a", date: "2026-11-24", type: "bed", actualAt: firstBedAt },
        { id: "bed-b", date: "2026-11-25", type: "bed", actualAt: secondBedAt },
        {
          id: "wake-a",
          date: "2026-11-25",
          type: "wake",
          actualAt: firstWakeAt,
        },
        {
          id: "wake-b",
          date: "2026-11-26",
          type: "wake",
          actualAt: secondWakeAt,
        },
      ],
      now,
    );

    expect(result.actualRecords).toEqual([
      {
        id: "legacy-0-bed-a",
        sleepDate: "2026-11-24",
        bedAt: firstBedAt,
        wakeAt: firstWakeAt,
      },
      {
        id: "legacy-1-bed-b",
        sleepDate: "2026-11-25",
        bedAt: secondBedAt,
        wakeAt: secondWakeAt,
      },
    ]);
    expect(result.recoveryEntries).toEqual([]);
  });

  it("preserves invalid, unmatched, and duplicate sleep dates in recovery", () => {
    const bedAt = new Date(2026, 10, 24, 22).getTime();
    const duplicateBedAt = new Date(2026, 10, 24, 23).getTime();
    const wakeAt = new Date(2026, 10, 25, 7).getTime();
    const secondWakeAt = new Date(2026, 10, 26, 7).getTime();
    const unmatchedWakeAt = new Date(2026, 10, 27, 7).getTime();
    const invalid = {
      id: "bad",
      date: "not-a-date",
      type: "bed",
      actualAt: bedAt,
    };

    const result = migrateLegacySleepEvents(
      initialSleepScheduleData,
      [
        { id: "bed-a", date: "2026-11-24", type: "bed", actualAt: bedAt },
        {
          id: "bed-b",
          date: "2026-11-24",
          type: "bed",
          actualAt: duplicateBedAt,
        },
        { id: "wake-a", date: "2026-11-25", type: "wake", actualAt: wakeAt },
        {
          id: "wake-b",
          date: "2026-11-26",
          type: "wake",
          actualAt: secondWakeAt,
        },
        {
          id: "wake-c",
          date: "2026-11-27",
          type: "wake",
          actualAt: unmatchedWakeAt,
        },
        invalid,
        null,
      ],
      now,
    );

    expect(result.actualRecords).toHaveLength(1);
    expect(result.actualRecords[0].wakeAt).toBe(secondWakeAt);
    expect(result.recoveryEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "legacy-1-bed-b",
          reason: "duplicateSleepDate",
        }),
        expect.objectContaining({
          id: "legacy-2-wake-a",
          reason: "duplicateSleepDate",
        }),
        expect.objectContaining({
          id: "legacy-4-wake-c",
          reason: "unmatchedWake",
        }),
        expect.objectContaining({
          id: "legacy-5-bad",
          reason: "invalidEvent",
          legacyEvent: invalid,
        }),
        expect.objectContaining({
          id: "legacy-6-unknown",
          reason: "invalidEvent",
          legacyEvent: null,
        }),
      ]),
    );
  });

  it("keeps retries idempotent when the Calendar source has not cleared", () => {
    const legacy = [
      {
        id: "bed-a",
        date: "2026-11-24",
        type: "bed",
        actualAt: new Date(2026, 10, 24, 22).getTime(),
      },
      {
        id: "wake-a",
        date: "2026-11-25",
        type: "wake",
        actualAt: new Date(2026, 10, 25, 7).getTime(),
      },
    ];

    const imported = migrateLegacySleepEvents(
      initialSleepScheduleData,
      legacy,
      now,
    );
    const retried = migrateLegacySleepEvents(imported, legacy, now);

    expect(retried.actualRecords).toEqual(imported.actualRecords);
    expect(retried.recoveryEntries).toEqual(imported.recoveryEntries);
  });
});

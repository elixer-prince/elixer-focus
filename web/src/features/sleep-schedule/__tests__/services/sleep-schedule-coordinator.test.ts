import { waitFor } from "@testing-library/react";
import {
  applySleepScheduleCommand,
  dispatchSleepScheduleCommand,
  startSleepScheduleCoordinator,
} from "@/features/sleep-schedule/services/sleep-schedule-coordinator";
import {
  initialSleepScheduleData,
  type ActualSleepRecord,
  type SleepScheduleData,
  type SleepScheduleSettings,
} from "@/features/sleep-schedule/types/sleep-schedule";
import { useSleepScheduleStore } from "@/features/sleep-schedule/stores/sleep-schedule-store";

const settings: SleepScheduleSettings = {
  wakeTime: "07:00",
  targetSleepDurationMinutes: 480,
  bedTimeOverride: null,
};

const now = new Date(2026, 10, 26, 12).getTime();

const record = (
  id: string,
  bedAt: number,
  wakeAt: number | null = null,
  sleepDate = "2026-11-25",
): ActualSleepRecord => ({
  id,
  sleepDate,
  bedAt,
  wakeAt,
});

const data: SleepScheduleData = {
  ...initialSleepScheduleData,
  settings,
};

const channels: FakeBroadcastChannel[] = [];

class FakeBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  messages: unknown[] = [];

  constructor(name: string) {
    this.name = name;
    channels.push(this);
  }

  postMessage(message: unknown) {
    this.messages.push(message);
  }

  close() {}
}

let stopCoordinator: (() => void) | undefined;

beforeEach(() => {
  channels.length = 0;
  localStorage.clear();
  useSleepScheduleStore.setState(initialSleepScheduleData);
  let id = 0;
  vi.stubGlobal("crypto", { randomUUID: () => `sleep-${++id}` });
});

afterEach(() => {
  stopCoordinator?.();
  stopCoordinator = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: undefined,
  });
});

describe("Sleep Schedule coordinator commands", () => {
  it("rejects invalid settings and preserves actual records when clearing the schedule", () => {
    expect(() =>
      applySleepScheduleCommand(
        data,
        {
          type: "save-settings",
          settings: { ...settings, targetSleepDurationMinutes: 485 },
        },
        now,
      ),
    ).toThrow("Review the wake time and sleep duration.");

    const withRecord = {
      ...data,
      actualRecords: [record("night-1", now - 10_000)],
    };
    const cleared = applySleepScheduleCommand(
      withRecord,
      { type: "clear-schedule" },
      now,
    );

    expect(cleared.settings).toEqual({
      ...settings,
      wakeTime: null,
      bedTimeOverride: null,
    });
    expect(cleared.actualRecords).toEqual(withRecord.actualRecords);
  });

  it("records a past bedtime and assigns wake time to the latest earlier incomplete night", () => {
    const firstBedAt = new Date(2026, 10, 24, 21).getTime();
    const secondBedAt = new Date(2026, 10, 25, 22).getTime();
    const first = applySleepScheduleCommand(
      {
        ...data,
        actualRecords: [record("night-a", firstBedAt, null, "2026-11-24")],
      },
      {
        type: "record-bed",
        sleepDate: "2026-11-25",
        actualAt: secondBedAt,
      },
      now,
    );
    const wakeAt = new Date(2026, 10, 26, 7).getTime();
    const completed = applySleepScheduleCommand(
      first,
      { type: "record-wake", actualAt: wakeAt },
      now,
    );

    expect(first.actualRecords).toHaveLength(2);
    expect(completed.actualRecords).toEqual([
      {
        ...record("night-a", firstBedAt, null, "2026-11-24"),
        wakeAt: null,
      },
      {
        id: "sleep-1",
        sleepDate: "2026-11-25",
        bedAt: secondBedAt,
        wakeAt,
      },
    ]);
  });

  it("updates the existing actual record for a local bedtime date", () => {
    const originalBedAt = new Date(2026, 10, 25, 21).getTime();
    const correctedBedAt = new Date(2026, 10, 25, 22).getTime();
    const updated = applySleepScheduleCommand(
      {
        ...data,
        actualRecords: [record("night-1", originalBedAt)],
      },
      {
        type: "record-bed",
        sleepDate: "2026-11-25",
        actualAt: correctedBedAt,
      },
      now,
    );

    expect(updated.actualRecords).toEqual([record("night-1", correctedBedAt)]);
  });

  it("rejects future actual timestamps and wake times before bedtime", () => {
    const futureAt = new Date(2026, 10, 27, 8).getTime();
    expect(() =>
      applySleepScheduleCommand(
        data,
        {
          type: "record-bed",
          sleepDate: "2026-11-27",
          actualAt: futureAt,
        },
        now,
      ),
    ).toThrow("Actual sleep times cannot be in the future.");

    const withRecord = {
      ...data,
      actualRecords: [record("night-1", now - 60_000)],
    };
    expect(() =>
      applySleepScheduleCommand(
        withRecord,
        { type: "record-wake", actualAt: now - 120_000 },
        now,
      ),
    ).toThrow("Record a bedtime before recording a wake time.");
  });

  it("requires confirmation before deleting a night with a recorded wake", () => {
    const withWake = {
      ...data,
      actualRecords: [record("night-1", now - 60_000, now)],
    };
    expect(() =>
      applySleepScheduleCommand(
        withWake,
        { type: "delete-night", recordId: "night-1" },
        now,
      ),
    ).toThrow("Confirm removing the recorded wake time first.");

    expect(
      applySleepScheduleCommand(
        withWake,
        {
          type: "delete-night",
          recordId: "night-1",
          confirmWakeRemoval: true,
        },
        now,
      ).actualRecords,
    ).toEqual([]);
  });

  it("persists valid commands and reports failed writes without applying them", async () => {
    const result = await dispatchSleepScheduleCommand({
      type: "save-settings",
      settings,
    });

    expect(result.success).toBe(true);
    expect(useSleepScheduleStore.getState().settings).toEqual(settings);
    expect(
      JSON.parse(localStorage.getItem("sleep-schedule-storage")!).state
        .settings,
    ).toEqual(settings);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage full");
    });
    const failed = await dispatchSleepScheduleCommand({
      type: "save-settings",
      settings: { ...settings, wakeTime: "08:00" },
    });

    expect(failed).toEqual({ success: false, error: "Storage full" });
    expect(useSleepScheduleStore.getState().settings).toEqual(settings);
  });

  it("holds the Web Lock while persisting and broadcasting owner commands", async () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, callback: () => Promise<void>) => callback(),
      },
    });

    stopCoordinator = startSleepScheduleCoordinator();
    await waitFor(() => {
      expect(channels[0].messages).toContainEqual(
        expect.objectContaining({ type: "state" }),
      );
    });
    expect(channels[0].messages).toContainEqual({ type: "request-state" });

    const result = await dispatchSleepScheduleCommand({
      type: "save-settings",
      settings,
    });

    expect(result.success).toBe(true);
    expect(useSleepScheduleStore.getState().settings).toEqual(settings);
    expect(
      JSON.parse(localStorage.getItem("sleep-schedule-storage")!).version,
    ).toBe(1);
    expect(channels[0].messages).toContainEqual(
      expect.objectContaining({ type: "state" }),
    );

    const remoteSettings = { ...settings, wakeTime: "08:00" };
    channels[0].onmessage?.({
      data: {
        type: "command",
        id: "remote-command",
        command: { type: "save-settings", settings: remoteSettings },
      },
    } as MessageEvent);
    await waitFor(() => {
      expect(useSleepScheduleStore.getState().settings).toEqual(remoteSettings);
    });
    expect(channels[0].messages).toContainEqual(
      expect.objectContaining({
        type: "result",
        id: "remote-command",
        result: { success: true },
      }),
    );
  });
});

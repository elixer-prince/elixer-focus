import { waitFor } from "@testing-library/react";
import { useCalendarStore } from "@/features/calendar/stores/calendar-store";
import { initialCalendarData } from "@/features/calendar/types/calendar";
import { useTasksStore } from "@/features/tasks/stores/tasks-store";
import { initialSleepScheduleData } from "@/features/sleep-schedule/types/sleep-schedule";
import {
  startSleepScheduleCoordinator,
  useSleepScheduleStore,
} from "@/features/sleep-schedule/stores/sleep-schedule-store";

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(new Date(2026, 10, 26, 12).getTime());
  localStorage.clear();
  useCalendarStore.setState(initialCalendarData);
  useTasksStore.setState({ tasks: [] });
  useSleepScheduleStore.setState(initialSleepScheduleData);
  vi.stubGlobal("BroadcastChannel", undefined);

  const { pendingSleepEventMigration: _pending, ...legacyCalendarData } =
    initialCalendarData;
  localStorage.setItem(
    "calendar-storage",
    JSON.stringify({
      state: {
        ...legacyCalendarData,
        sleepEventRecords: [
          {
            id: "legacy-bed",
            date: "2026-11-25",
            type: "bed",
            actualAt: new Date(2026, 10, 25, 22).getTime(),
          },
          {
            id: "legacy-wake",
            date: "2026-11-26",
            type: "wake",
            actualAt: new Date(2026, 10, 26, 7).getTime(),
          },
        ],
      },
      version: 1,
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Sleep Schedule startup import", () => {
  it("persists converted actual records before clearing the Calendar source", async () => {
    const stop = startSleepScheduleCoordinator();

    try {
      await waitFor(() => {
        const savedSleep = JSON.parse(
          localStorage.getItem("sleep-schedule-storage")!,
        );
        const savedCalendar = JSON.parse(
          localStorage.getItem("calendar-storage")!,
        );

        expect(savedSleep.state.actualRecords).toEqual([
          {
            id: "legacy-0-legacy-bed",
            sleepDate: "2026-11-25",
            bedAt: new Date(2026, 10, 25, 22).getTime(),
            wakeAt: new Date(2026, 10, 26, 7).getTime(),
          },
        ]);
        expect(savedCalendar.version).toBe(2);
        expect(savedCalendar.state.pendingSleepEventMigration).toEqual([]);
        expect(savedCalendar.state.sleepEventRecords).toBeUndefined();
      });
    } finally {
      stop();
    }
  });
});

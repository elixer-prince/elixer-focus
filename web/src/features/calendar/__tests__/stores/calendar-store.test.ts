import { useCalendarStore } from "@/features/calendar/stores/calendar-store";
import { initialCalendarData } from "@/features/calendar/types/calendar";

describe("calendar storage migration", () => {
  beforeEach(() => {
    localStorage.clear();
    useCalendarStore.setState(initialCalendarData);
  });

  it("retains legacy sleep events as a pending import and removes the active field", async () => {
    const legacyEvent = {
      id: "legacy-bed",
      date: "2026-11-25",
      type: "bed",
      actualAt: new Date(2026, 10, 25, 22).getTime(),
    };
    const { pendingSleepEventMigration: _pending, ...legacyCalendarData } =
      initialCalendarData;
    localStorage.setItem(
      "calendar-storage",
      JSON.stringify({
        state: { ...legacyCalendarData, sleepEventRecords: [legacyEvent] },
        version: 1,
      }),
    );

    await useCalendarStore.persist.rehydrate();

    expect(useCalendarStore.getState().pendingSleepEventMigration).toEqual([
      legacyEvent,
    ]);
    const saved = JSON.parse(localStorage.getItem("calendar-storage")!);
    expect(saved.version).toBe(2);
    expect(saved.state.pendingSleepEventMigration).toEqual([legacyEvent]);
    expect(saved.state.sleepEventRecords).toBeUndefined();
  });
});

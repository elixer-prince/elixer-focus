import { registerCalendarStateHandler } from "@/features/calendar/services/calendar-coordinator";
import {
  initialCalendarData,
  isWeekStartsOn,
  type CalendarData,
} from "@/features/calendar/types/calendar";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type CalendarActions = {
  setCalendarData: (data: CalendarData) => void;
};

type CalendarStore = CalendarData & CalendarActions;

const migrateCalendarData = (
  state: unknown,
  version: number,
): CalendarStore => {
  const saved = state as
    | (Partial<CalendarData> & { sleepEventRecords?: unknown[] })
    | null;
  const weekStartsOn = saved?.weekStartsOn;
  const pendingSleepEvents =
    saved &&
    Object.prototype.hasOwnProperty.call(saved, "pendingSleepEventMigration")
      ? saved.pendingSleepEventMigration
      : version < 2
        ? saved?.sleepEventRecords
        : undefined;

  return {
    recurrenceSeries: saved?.recurrenceSeries ?? [],
    recurrenceRuleSegments: saved?.recurrenceRuleSegments ?? [],
    scheduledOccurrences: saved?.scheduledOccurrences ?? [],
    pendingSleepEventMigration:
      pendingSleepEvents === undefined
        ? []
        : Array.isArray(pendingSleepEvents)
          ? pendingSleepEvents
          : [pendingSleepEvents],
    weekStartsOn: isWeekStartsOn(weekStartsOn) ? weekStartsOn : 0,
  } as CalendarStore;
};

export const useCalendarStore = create<CalendarStore>()(
  persist(
    immer((set) => ({
      ...initialCalendarData,
      setCalendarData: (data) => set(data),
    })),
    createPersistOptions<CalendarStore>({
      name: "calendar-storage",
      version: 2,
      migrate: migrateCalendarData,
    }),
  ),
);

registerCalendarStateHandler({
  apply: (data) => useCalendarStore.setState(data),
  get: () => useCalendarStore.getState(),
  rehydrate: async () => {
    await useCalendarStore.persist.rehydrate();
  },
});

export const useScheduledOccurrences = () =>
  useCalendarStore((state) => state.scheduledOccurrences);

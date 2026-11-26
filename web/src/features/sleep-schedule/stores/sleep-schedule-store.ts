import {
  registerSleepScheduleStateHandler,
  startSleepScheduleCoordinator as startSleepScheduleCoordinatorService,
} from "@/features/sleep-schedule/services/sleep-schedule-coordinator";
import {
  initialSleepScheduleData,
  type SleepScheduleData,
} from "@/features/sleep-schedule/types/sleep-schedule";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SleepScheduleStore = SleepScheduleData & {
  setSleepScheduleData: (data: SleepScheduleData) => void;
};

export const migrateSleepScheduleData = (
  state: unknown,
  _version: number,
): SleepScheduleStore => {
  const saved =
    state && typeof state === "object"
      ? (state as Partial<SleepScheduleData>)
      : null;
  const settings =
    saved && "settings" in saved
      ? saved.settings
      : initialSleepScheduleData.settings;

  return {
    settings: settings as SleepScheduleData["settings"],
    actualRecords: Array.isArray(saved?.actualRecords)
      ? saved.actualRecords
      : [],
    recoveryEntries: Array.isArray(saved?.recoveryEntries)
      ? saved.recoveryEntries
      : [],
  } as SleepScheduleStore;
};

export const useSleepScheduleStore = create<SleepScheduleStore>()(
  persist(
    immer((set) => ({
      ...initialSleepScheduleData,
      setSleepScheduleData: (data) => set(data),
    })),
    createPersistOptions<SleepScheduleStore>({
      name: "sleep-schedule-storage",
      version: 1,
      migrate: migrateSleepScheduleData,
    }),
  ),
);

registerSleepScheduleStateHandler({
  apply: (data) => useSleepScheduleStore.setState(data),
  get: () => {
    const { settings, actualRecords, recoveryEntries } =
      useSleepScheduleStore.getState();
    return { settings, actualRecords, recoveryEntries };
  },
  rehydrate: async () => {
    await useSleepScheduleStore.persist.rehydrate();
  },
});

export const startSleepScheduleCoordinator = () =>
  startSleepScheduleCoordinatorService();

export const useSleepScheduleSettings = () =>
  useSleepScheduleStore((state) => state.settings);

export const useActualSleepRecords = () =>
  useSleepScheduleStore((state) => state.actualRecords);

export const useSleepMigrationRecovery = () =>
  useSleepScheduleStore((state) => state.recoveryEntries);

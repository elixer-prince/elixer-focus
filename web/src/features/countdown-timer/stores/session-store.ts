import type { CountdownSession } from "@/features/countdown-timer/types/session";
import {
  createTimerSettingsSlice,
  type TimerSettingsSlice,
} from "@elixer-focus/shared/timer";
import {
  createPersistOptions,
  persist,
  simpleMigrate,
} from "@/stores/persist-config";
import { create } from "zustand";

type SessionState = {
  currentSessionType: CountdownSession;
  previousSessionType: CountdownSession | null;
  currentSessionCount: number;
  totalSessionsCompleted: number;
};

type SessionActions = {
  setCurrentSessionType: (type: CountdownSession) => void;
  setPreviousSessionType: (type: CountdownSession) => void;
  incrementCurrentSessionCount: () => void;
  resetCurrentSessionCount: () => void;
  setTotalSessionsCompleted: (count: number) => void;
};

type SessionStore = TimerSettingsSlice & SessionState & SessionActions;

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get, api) => ({
      ...createTimerSettingsSlice<SessionStore>()(set, get, api),
      currentSessionType: "Focus",
      previousSessionType: null,
      currentSessionCount: 0,
      totalSessionsCompleted: 0,

      setCurrentSessionType: (type) => set({ currentSessionType: type }),

      setPreviousSessionType: (type) => set({ previousSessionType: type }),

      incrementCurrentSessionCount: () =>
        set((state) => ({
          currentSessionCount: state.currentSessionCount + 1,
        })),

      resetCurrentSessionCount: () => set({ currentSessionCount: 0 }),

      setTotalSessionsCompleted: (count) =>
        set({ totalSessionsCompleted: count }),
    }),
    createPersistOptions<SessionStore>({
      name: "session-storage",
      version: 2,
      migrate: simpleMigrate<SessionStore>,
    }),
  ),
);

// States

export const useFocusDuration = () =>
  useSessionStore((state) => state.focusDuration);

export const useShortBreakDuration = () =>
  useSessionStore((state) => state.shortBreakDuration);

export const useLongBreakDuration = () =>
  useSessionStore((state) => state.longBreakDuration);

export const useSessionCountLimit = () =>
  useSessionStore((state) => state.sessionCountLimit);

export const useCurrentSessionType = () =>
  useSessionStore((state) => state.currentSessionType);

export const usePreviousSessionType = () =>
  useSessionStore((state) => state.previousSessionType);

export const useCurrentSessionCount = () =>
  useSessionStore((state) => state.currentSessionCount);

export const useResetCurrentSessionCount = () =>
  useSessionStore((state) => state.resetCurrentSessionCount);

export const useTotalSessionsCompleted = () =>
  useSessionStore((state) => state.totalSessionsCompleted);

export const useAttributeSessionOverrun = () =>
  useSessionStore((state) => state.attributeSessionOverrun);

// Actions

export const useSetFocusDuration = () =>
  useSessionStore((state) => state.setFocusDuration);

export const useSetShortBreakDuration = () =>
  useSessionStore((state) => state.setShortBreakDuration);

export const useSetLongBreakDuration = () =>
  useSessionStore((state) => state.setLongBreakDuration);

export const useSetSessionCountLimit = () =>
  useSessionStore((state) => state.setSessionCountLimit);

export const useSetCurrentSessionType = () =>
  useSessionStore((state) => state.setCurrentSessionType);

export const useSetPreviousSessionType = () =>
  useSessionStore((state) => state.setPreviousSessionType);

export const useIncrementCurrentSessionCount = () =>
  useSessionStore((state) => state.incrementCurrentSessionCount);

export const useSetTotalSessionsCompleted = () =>
  useSessionStore((state) => state.setTotalSessionsCompleted);

export const useSetAttributeSessionOverrun = () =>
  useSessionStore((state) => state.setAttributeSessionOverrun);

import type {
  CountdownSession,
  CustomSession,
} from "@/features/countdown-timer/types/session";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  customSessionDuration: number;
  customSessionType: CustomSession;
  sessionCountLimit: number;
  currentSessionType: CountdownSession;
  previousSessionType: CountdownSession | null;
  currentSessionCount: number;
  totalSessionsCompleted: number;
};

type SessionActions = {
  setFocusDuration: (duration: number) => void;
  setShortBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  setCustomSessionDuration: (duration: number) => void;
  setCustomSessionType: (type: CustomSession) => void;
  setSessionCountLimit: (limit: number) => void;
  setCurrentSessionType: (type: CountdownSession) => void;
  setPreviousSessionType: (type: CountdownSession) => void;
  incrementCurrentSessionCount: () => void;
  resetCurrentSessionCount: () => void;
  setTotalSessionsCompleted: (count: number) => void;
};

type SessionStore = SessionState & SessionActions;

const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      customSessionDuration: 0,
      customSessionType: "Focus",
      sessionCountLimit: 4,
      currentSessionType: "Focus",
      previousSessionType: null,
      currentSessionCount: 0,
      totalSessionsCompleted: 0,

      setFocusDuration: (duration) => set({ focusDuration: duration }),

      setShortBreakDuration: (duration) =>
        set({ shortBreakDuration: duration }),

      setLongBreakDuration: (duration) => set({ longBreakDuration: duration }),

      setCustomSessionDuration: (duration) =>
        set({ customSessionDuration: duration }),

      setCustomSessionType: (type) => set({ customSessionType: type }),

      setSessionCountLimit: (limit) => set({ sessionCountLimit: limit }),

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
    { name: "session-storage" },
  ),
);

/*-------------------------------------
| SESSION STORE EXPORTS
|--------------------------------------
|
*/

// STATES

export const useFocusDuration = () =>
  useSessionStore((state) => state.focusDuration);

export const useShortBreakDuration = () =>
  useSessionStore((state) => state.shortBreakDuration);

export const useLongBreakDuration = () =>
  useSessionStore((state) => state.longBreakDuration);

export const useCustomSessionDuration = () =>
  useSessionStore((state) => state.customSessionDuration);

export const useCustomSessionType = () =>
  useSessionStore((state) => state.customSessionType);

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

// ACTIONS

export const useSetFocusDuration = () =>
  useSessionStore((state) => state.setFocusDuration);

export const useSetShortBreakDuration = () =>
  useSessionStore((state) => state.setShortBreakDuration);

export const useSetLongBreakDuration = () =>
  useSessionStore((state) => state.setLongBreakDuration);

export const useSetCustomSessionDuration = () =>
  useSessionStore((state) => state.setCustomSessionDuration);

export const useSetCustomSessionType = () =>
  useSessionStore((state) => state.setCustomSessionType);

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

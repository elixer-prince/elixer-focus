import type { CountdownSession } from "@/features/countdown-timer/types/session";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
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
  setSessionCountLimit: (limit: number) => void;
  setCurrentSessionType: (type: CountdownSession) => void;
  setPreviousSessionType: (type: CountdownSession) => void;
  setCurrentSessionCount: (count: number) => void;
  setTotalSessionsCompleted: (count: number) => void;
};

type SessionStore = SessionState & SessionActions;

const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionCountLimit: 4,
      currentSessionType: "Focus",
      previousSessionType: null,
      currentSessionCount: 0,
      totalSessionsCompleted: 0,

      setFocusDuration: (duration) => set({ focusDuration: duration }),

      setShortBreakDuration: (duration) =>
        set({ shortBreakDuration: duration }),

      setLongBreakDuration: (duration) => set({ longBreakDuration: duration }),

      setSessionCountLimit: (limit) => set({ sessionCountLimit: limit }),

      setCurrentSessionType: (type) => set({ currentSessionType: type }),

      setPreviousSessionType: (type) => set({ previousSessionType: type }),

      setCurrentSessionCount: (count) => set({ currentSessionCount: count }),

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

export const useSessionCountLimit = () =>
  useSessionStore((state) => state.sessionCountLimit);

export const useCurrentSessionType = () =>
  useSessionStore((state) => state.currentSessionType);

export const usePreviousSessionType = () =>
  useSessionStore((state) => state.previousSessionType);

export const useCurrentSessionCount = () =>
  useSessionStore((state) => state.currentSessionCount);

export const useTotalSessionsCompleted = () =>
  useSessionStore((state) => state.totalSessionsCompleted);

// ACTIONS

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

export const useSetCurrentSessionCount = () =>
  useSessionStore((state) => state.setCurrentSessionCount);

export const useSetTotalSessionsCompleted = () =>
  useSessionStore((state) => state.setTotalSessionsCompleted);

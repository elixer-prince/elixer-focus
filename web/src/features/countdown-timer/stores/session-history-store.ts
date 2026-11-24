import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import type { CountdownSession } from "@/features/countdown-timer/types/session";
import {
  useCurrentSessionType,
  useSessionStore,
} from "@/features/countdown-timer/stores/session-store";
import {
  useCountdownTimerStore,
  useSessionProgressInSeconds,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SessionHistoryState = {
  sessions: CompletedSession[];
  lastCompletedSession: CompletedSession | null;
};

type SessionHistoryActions = {
  addSession: (
    sessionType: CountdownSession,
    durationInSeconds: number,
  ) => void;
  removeSession: (id: string) => void;
  clearSessions: () => void;
  clearLastCompletedSession: () => void;
};

type SessionHistoryStore = SessionHistoryState & SessionHistoryActions;

const useSessionHistoryStore = create<SessionHistoryStore>()(
  persist(
    immer((set) => ({
      sessions: [],
      lastCompletedSession: null,

      addSession: (sessionType, durationInSeconds) =>
        set((state) => {
          const newSession: CompletedSession = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            sessionType,
            durationInSeconds,
            completedAt: Date.now(),
          };
          state.sessions.push(newSession);
          state.lastCompletedSession = newSession;
        }),

      removeSession: (id) =>
        set((state) => {
          state.sessions = state.sessions.filter((s) => s.id !== id);
        }),

      clearSessions: () =>
        set((state) => {
          state.sessions = [];
          state.lastCompletedSession = null;
        }),

      clearLastCompletedSession: () =>
        set((state) => {
          state.lastCompletedSession = null;
        }),
    })),
    createPersistOptions<SessionHistoryStore>({
      name: "session-history-storage",
      version: 1,
    }),
  ),
);

/*-------------------------------------
| SESSION HISTORY - QUERY UTILITIES
|--------------------------------------
|
*/

/**
 * Returns sessions completed within the given date range.
 *
 * @param from - Start timestamp (inclusive).
 * @param to - End timestamp (inclusive).
 * @returns {CompletedSession[]} Sessions within the range.
 */
export const getSessionsByDateRange = (
  from: number,
  to: number,
): CompletedSession[] => {
  const { sessions } = useSessionHistoryStore.getState();
  return sessions.filter((s) => s.completedAt >= from && s.completedAt <= to);
};

/**
 * Returns sessions completed on the given calendar day (local time).
 *
 * @param date - The date to query.
 * @returns {CompletedSession[]} Sessions completed on that day.
 */
export const getSessionsByDay = (date: Date): CompletedSession[] => {
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const endOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  ).getTime();
  return getSessionsByDateRange(startOfDay, endOfDay);
};

/**
 * Returns total focus time in seconds for the given date range.
 *
 * @param from - Start timestamp (inclusive).
 * @param to - End timestamp (inclusive).
 * @returns {number} Total focus seconds.
 */
export const getTotalFocusTime = (from: number, to: number): number => {
  const sessions = getSessionsByDateRange(from, to);
  return sessions
    .filter((s) => s.sessionType === "Focus")
    .reduce((sum, s) => sum + s.durationInSeconds, 0);
};

/**
 * Returns the progress time of the currently running focus timer, if any.
 * Returns 0 if the timer is not running or the current session is not Focus.
 */
export function getRunningTimerProgress(): number {
  const { timerRunning, sessionProgressInSeconds } =
    useCountdownTimerStore.getState();
  const { currentSessionType } = useSessionStore.getState();
  if (timerRunning && currentSessionType === "Focus") {
    return sessionProgressInSeconds;
  }
  return 0;
}

/**
 * Returns total focus time including the currently running timer if applicable.
 *
 * @param from - Start timestamp (inclusive).
 * @param to - End timestamp (inclusive).
 * @returns {number} Total focus seconds including running timer.
 */
export const getTotalFocusTimeWithRunning = (
  from: number,
  to: number,
): number => {
  return getTotalFocusTime(from, to) + getRunningTimerProgress();
};

/**
 * React hook that returns total focus time and re-renders when the timer
 * state or session history changes.
 *
 * @param from - Start timestamp (inclusive).
 * @param to - End timestamp (inclusive).
 * @returns {number} Total focus seconds including running timer.
 */
export function useGetTotalFocusTime(from: number, to: number): number {
  const sessions = useSessions();
  const timerRunning = useTimerRunning();
  const sessionProgress = useSessionProgressInSeconds();
  const currentSessionType = useCurrentSessionType();

  const completedTime = sessions
    .filter(
      (s) =>
        s.sessionType === "Focus" &&
        s.completedAt >= from &&
        s.completedAt <= to,
    )
    .reduce((sum, s) => sum + s.durationInSeconds, 0);

  if (timerRunning && currentSessionType === "Focus") {
    return completedTime + sessionProgress;
  }
  return completedTime;
}

/**
 * React hook that returns an array of focus times for multiple date ranges,
 * subscribing to timer and session changes. Useful for chart components.
 * The running timer elapsed time is only added to the range that includes
 * the current moment (today), not to all ranges.
 *
 * @param ranges - Array of { start, end } timestamp pairs.
 * @returns {number[]} Focus time in seconds for each range.
 */
export function useGetTotalFocusTimeForRanges(
  ranges: { start: number; end: number }[],
): number[] {
  const sessions = useSessions();
  const timerRunning = useTimerRunning();
  const sessionProgress = useSessionProgressInSeconds();
  const currentSessionType = useCurrentSessionType();

  const now = Date.now();
  const runningProgress =
    timerRunning && currentSessionType === "Focus" ? sessionProgress : 0;

  return ranges.map((range) => {
    const completedTime = sessions
      .filter(
        (s) =>
          s.sessionType === "Focus" &&
          s.completedAt >= range.start &&
          s.completedAt <= range.end,
      )
      .reduce((sum, s) => sum + s.durationInSeconds, 0);
    // Only add running progress time to the range that includes now (today)
    const isCurrentRange = now >= range.start && now <= range.end;
    return completedTime + (isCurrentRange ? runningProgress : 0);
  });
}

/**
 * Returns session count by type for the given date range.
 *
 * @param from - Start timestamp (inclusive).
 * @param to - End timestamp (inclusive).
 * @returns {{ Focus: number, "Short Break": number, "Long Break": number }}
 */
export const getSessionCountsByType = (
  from: number,
  to: number,
): Record<CountdownSession, number> => {
  const sessions = getSessionsByDateRange(from, to);
  const counts: Record<CountdownSession, number> = {
    Focus: 0,
    "Short Break": 0,
    "Long Break": 0,
  };
  for (const session of sessions) {
    counts[session.sessionType]++;
  }
  return counts;
};

/*-------------------------------------
| SESSION HISTORY - STORE EXPORTS
|--------------------------------------
|
*/

// STATES

export const useSessions = () =>
  useSessionHistoryStore((state) => state.sessions);

export const useLastCompletedSession = () =>
  useSessionHistoryStore((state) => state.lastCompletedSession);

// ACTIONS

export const useAddSession = () =>
  useSessionHistoryStore((state) => state.addSession);

export const useRemoveSession = () =>
  useSessionHistoryStore((state) => state.removeSession);

export const useClearSessions = () =>
  useSessionHistoryStore((state) => state.clearSessions);

export const useClearLastCompletedSession = () =>
  useSessionHistoryStore((state) => state.clearLastCompletedSession);

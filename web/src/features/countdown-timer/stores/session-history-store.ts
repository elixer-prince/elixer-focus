import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import type { CountdownSession } from "@/features/countdown-timer/types/session";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SessionHistoryState = {
  sessions: CompletedSession[];
};

type SessionHistoryActions = {
  addSession: (
    sessionType: CountdownSession,
    durationInSeconds: number,
  ) => void;
  removeSession: (id: string) => void;
  clearSessions: () => void;
};

type SessionHistoryStore = SessionHistoryState & SessionHistoryActions;

const useSessionHistoryStore = create<SessionHistoryStore>()(
  persist(
    immer((set) => ({
      sessions: [],

      addSession: (sessionType, durationInSeconds) =>
        set((state) => {
          state.sessions.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            sessionType,
            durationInSeconds,
            completedAt: Date.now(),
          });
        }),

      removeSession: (id) =>
        set((state) => {
          state.sessions = state.sessions.filter((s) => s.id !== id);
        }),

      clearSessions: () =>
        set((state) => {
          state.sessions = [];
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

// ACTIONS

export const useAddSession = () =>
  useSessionHistoryStore((state) => state.addSession);

export const useRemoveSession = () =>
  useSessionHistoryStore((state) => state.removeSession);

export const useClearSessions = () =>
  useSessionHistoryStore((state) => state.clearSessions);

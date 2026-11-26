import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import type { CountdownSession } from "@/features/countdown-timer/types/session";
import type { TrackedInterval } from "@/features/countdown-timer/types/tracked-interval";
import {
  closeOpenTrackedIntervals,
  openTrackedInterval,
} from "@/features/countdown-timer/utils/tracked-intervals";
import {
  useCurrentSessionType,
  useSessionStore,
} from "@/features/countdown-timer/stores/session-store";
import {
  useCountdownTimerStore,
  useSessionProgressInSeconds,
  useTimerPaused,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SessionHistoryState = {
  sessions: CompletedSession[];
  lastCompletedSession: CompletedSession | null;
  trackedIntervals: TrackedInterval[];
  reflectionDraft: string;
};

type SessionHistoryActions = {
  addSession: (
    sessionType: CountdownSession,
    durationInSeconds: number,
  ) => void;
  completeSession: (
    sessionType: CountdownSession,
    durationInSeconds: number,
    completedAt: number,
    id: string,
    attributeOverrun: boolean,
  ) => void;
  initializeTracking: (
    at: number,
    timerActive: boolean,
    attributeOverrun: boolean,
  ) => void;
  startIdleInterval: (at: number) => void;
  closeIdleInterval: (at: number) => void;
  resolvePendingSession: (id: string, at: number) => void;
  setReflectionDraft: (draft: string) => void;
  removeSession: (id: string) => void;
  clearSessions: () => void;
  clearLastCompletedSession: () => void;
};

export type SessionHistoryStore = SessionHistoryState & SessionHistoryActions;

export const useSessionHistoryStore = create<SessionHistoryStore>()(
  persist(
    immer((set, get) => ({
      sessions: [],
      lastCompletedSession: null,
      trackedIntervals: [],
      reflectionDraft: "",

      addSession: (sessionType, durationInSeconds) =>
        get().completeSession(
          sessionType,
          durationInSeconds,
          Date.now(),
          crypto.randomUUID(),
          useSessionStore.getState().attributeSessionOverrun,
        ),

      completeSession: (
        sessionType,
        durationInSeconds,
        completedAt,
        id,
        attributeOverrun,
      ) =>
        set((state) => {
          if (state.sessions.some((session) => session.id === id)) return;

          const newSession: CompletedSession = {
            id,
            sessionType,
            durationInSeconds,
            completedAt,
          };
          state.sessions.push(newSession);
          state.lastCompletedSession = newSession;
          state.reflectionDraft = "";
          const intervals = closeOpenTrackedIntervals(
            state.trackedIntervals,
            completedAt,
          );
          state.trackedIntervals = openTrackedInterval(
            intervals,
            attributeOverrun ? "overrun" : "idle",
            completedAt,
            attributeOverrun ? id : null,
          );
        }),

      initializeTracking: (at, timerActive, attributeOverrun) =>
        set((state) => {
          const openIntervals = state.trackedIntervals.filter(
            (interval) => interval.endedAt === null,
          );
          if (openIntervals.length === 1) return;
          if (openIntervals.length > 1) {
            state.trackedIntervals = closeOpenTrackedIntervals(
              state.trackedIntervals,
              at,
            );
          }

          if (state.lastCompletedSession) {
            const session = state.lastCompletedSession;
            state.trackedIntervals = openTrackedInterval(
              state.trackedIntervals,
              attributeOverrun ? "overrun" : "idle",
              session.completedAt,
              attributeOverrun ? session.id : null,
            );
            return;
          }

          if (!timerActive) {
            state.trackedIntervals = openTrackedInterval(
              state.trackedIntervals,
              "idle",
              at,
            );
          }
        }),

      startIdleInterval: (at) =>
        set((state) => {
          if (state.lastCompletedSession) return;
          state.trackedIntervals = openTrackedInterval(
            state.trackedIntervals,
            "idle",
            at,
          );
        }),

      closeIdleInterval: (at) =>
        set((state) => {
          const openInterval = state.trackedIntervals.find(
            (interval) => interval.endedAt === null,
          );
          if (openInterval?.kind === "idle") {
            state.trackedIntervals = closeOpenTrackedIntervals(
              state.trackedIntervals,
              at,
            );
          }
        }),

      resolvePendingSession: (id, at) =>
        set((state) => {
          if (state.lastCompletedSession?.id !== id) return;

          const openOverrun = state.trackedIntervals.find(
            (interval) =>
              interval.kind === "overrun" &&
              interval.sessionId === id &&
              interval.endedAt === null,
          );
          if (openOverrun) {
            state.trackedIntervals = openTrackedInterval(
              closeOpenTrackedIntervals(state.trackedIntervals, at),
              "idle",
              at,
            );
          }
          state.lastCompletedSession = null;
          state.reflectionDraft = "";
        }),

      setReflectionDraft: (draft) =>
        set((state) => {
          if (state.lastCompletedSession) state.reflectionDraft = draft;
        }),

      removeSession: (id) =>
        set((state) => {
          state.sessions = state.sessions.filter((s) => s.id !== id);
          const openOverrun = state.trackedIntervals.some(
            (interval) =>
              interval.kind === "overrun" &&
              interval.sessionId === id &&
              interval.endedAt === null,
          );
          state.trackedIntervals = state.trackedIntervals.filter(
            (interval) =>
              interval.kind !== "overrun" || interval.sessionId !== id,
          );
          if (state.lastCompletedSession?.id === id) {
            state.lastCompletedSession = null;
            state.reflectionDraft = "";
          }
          if (openOverrun) {
            state.trackedIntervals = openTrackedInterval(
              state.trackedIntervals,
              "idle",
              Date.now(),
            );
          }
        }),

      clearSessions: () =>
        set((state) => {
          state.sessions = [];
          const openOverrun = state.trackedIntervals.some(
            (interval) =>
              interval.kind === "overrun" && interval.endedAt === null,
          );
          state.trackedIntervals = state.trackedIntervals.filter(
            (interval) => interval.kind !== "overrun",
          );
          state.lastCompletedSession = null;
          state.reflectionDraft = "";
          if (openOverrun) {
            state.trackedIntervals = openTrackedInterval(
              state.trackedIntervals,
              "idle",
              Date.now(),
            );
          }
        }),

      clearLastCompletedSession: () => {
        const pending = get().lastCompletedSession;
        if (pending) get().resolvePendingSession(pending.id, Date.now());
      },
    })),
    createPersistOptions<SessionHistoryStore>({
      name: "session-history-storage",
      version: 2,
      migrate: (state) => state as SessionHistoryStore,
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
  const { timerRunning, timerPaused, sessionProgressInSeconds } =
    useCountdownTimerStore.getState();
  const { currentSessionType } = useSessionStore.getState();
  if (timerRunning && !timerPaused && currentSessionType === "Focus") {
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
  const timerPaused = useTimerPaused();
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

  const now = Date.now();
  const runningProgress =
    timerRunning &&
    !timerPaused &&
    currentSessionType === "Focus" &&
    now >= from &&
    now <= to
      ? sessionProgress
      : 0;

  return completedTime + runningProgress;
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
  const timerPaused = useTimerPaused();
  const sessionProgress = useSessionProgressInSeconds();
  const currentSessionType = useCurrentSessionType();

  const now = Date.now();
  const runningProgress =
    timerRunning && !timerPaused && currentSessionType === "Focus"
      ? sessionProgress
      : 0;

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

export const useTrackedIntervals = () =>
  useSessionHistoryStore((state) => state.trackedIntervals);

export const useReflectionDraft = () =>
  useSessionHistoryStore((state) => state.reflectionDraft);

// ACTIONS

export const useAddSession = () =>
  useSessionHistoryStore((state) => state.addSession);

export const useCompleteSession = () =>
  useSessionHistoryStore((state) => state.completeSession);

export const useInitializeTracking = () =>
  useSessionHistoryStore((state) => state.initializeTracking);

export const useStartIdleInterval = () =>
  useSessionHistoryStore((state) => state.startIdleInterval);

export const useCloseIdleInterval = () =>
  useSessionHistoryStore((state) => state.closeIdleInterval);

export const useResolvePendingSession = () =>
  useSessionHistoryStore((state) => state.resolvePendingSession);

export const useSetReflectionDraft = () =>
  useSessionHistoryStore((state) => state.setReflectionDraft);

export const useRemoveSession = () =>
  useSessionHistoryStore((state) => state.removeSession);

export const useClearSessions = () =>
  useSessionHistoryStore((state) => state.clearSessions);

export const useClearLastCompletedSession = () =>
  useSessionHistoryStore((state) => state.clearLastCompletedSession);

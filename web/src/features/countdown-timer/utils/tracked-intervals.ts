import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import type {
  TrackedInterval,
  TrackedIntervalKind,
} from "@/features/countdown-timer/types/tracked-interval";
import type { CountdownSession } from "@/features/countdown-timer/types/session";

export type TrackedTimeTotals = {
  idleSeconds: number;
  overrunBySessionType: Record<CountdownSession, number>;
};

export const closeOpenTrackedIntervals = (
  intervals: TrackedInterval[],
  endedAt: number,
): TrackedInterval[] =>
  intervals.map((interval) => {
    if (interval.endedAt !== null) return interval;

    const safeEnd = Math.max(interval.startedAt, endedAt);
    return { ...interval, endedAt: safeEnd, updatedAt: safeEnd };
  });

export const openTrackedInterval = (
  intervals: TrackedInterval[],
  kind: TrackedIntervalKind,
  startedAt: number,
  sessionId: string | null = null,
  id: string = crypto.randomUUID(),
): TrackedInterval[] => {
  const openIntervals = intervals.filter(
    (interval) => interval.endedAt === null,
  );
  const openInterval = openIntervals[0];
  if (
    openIntervals.length === 1 &&
    openInterval?.kind === kind &&
    openInterval.sessionId === sessionId
  ) {
    return intervals;
  }

  const closeAt = openIntervals.reduce(
    (timestamp, interval) => Math.max(timestamp, interval.startedAt),
    startedAt,
  );
  const closedIntervals = closeOpenTrackedIntervals(intervals, closeAt);
  const latestEnd = closedIntervals.reduce(
    (latest, interval) => Math.max(latest, interval.endedAt ?? 0),
    0,
  );
  const safeStart = Math.max(startedAt, latestEnd);
  const newInterval: TrackedInterval = {
    id,
    kind,
    startedAt: safeStart,
    endedAt: null,
    sessionId,
    userId: null,
    createdAt: safeStart,
    updatedAt: safeStart,
  };

  return [...closedIntervals, newInterval];
};

export const getTrackedTimeTotalsForRange = (
  intervals: TrackedInterval[],
  sessions: CompletedSession[],
  from: number,
  to: number,
  now = Date.now(),
): TrackedTimeTotals => {
  const overrunBySessionType: Record<CountdownSession, number> = {
    Focus: 0,
    "Short Break": 0,
    "Long Break": 0,
  };
  const sessionTypes = new Map(
    sessions.map((session) => [session.id, session.sessionType]),
  );
  let idleSeconds = 0;

  for (const interval of intervals) {
    const overlapStart = Math.max(interval.startedAt, from);
    const overlapEnd = Math.min(interval.endedAt ?? now, to);
    const seconds = Math.max(0, Math.floor((overlapEnd - overlapStart) / 1000));

    if (interval.kind === "idle") {
      idleSeconds += seconds;
      continue;
    }

    const sessionType = interval.sessionId
      ? sessionTypes.get(interval.sessionId)
      : undefined;
    if (sessionType) overrunBySessionType[sessionType] += seconds;
  }

  return { idleSeconds, overrunBySessionType };
};

export const getTrackedIntervalElapsedSeconds = (
  interval: TrackedInterval,
  now = Date.now(),
): number =>
  Math.max(
    0,
    Math.floor(((interval.endedAt ?? now) - interval.startedAt) / 1000),
  );

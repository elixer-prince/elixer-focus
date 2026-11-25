import {
  useSessions,
  useTrackedIntervals,
} from "@/features/countdown-timer/stores/session-history-store";
import {
  getTrackedTimeTotalsForRange,
  type TrackedTimeTotals,
} from "@/features/countdown-timer/utils/tracked-intervals";
import { useEffect, useMemo, useState } from "react";

export type TrackedTimeRange = { start: number; end: number };

const useTrackedTimeTotalsForRanges = (ranges: TrackedTimeRange[]) => {
  const intervals = useTrackedIntervals();
  const sessions = useSessions();
  const [now, setNow] = useState(Date.now());
  const hasOpenInterval = intervals.some(
    (interval) => interval.endedAt === null,
  );

  useEffect(() => {
    if (!hasOpenInterval) return;
    const intervalId = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(intervalId);
  }, [hasOpenInterval]);

  return useMemo<TrackedTimeTotals[]>(
    () =>
      ranges.map((range) =>
        getTrackedTimeTotalsForRange(
          intervals,
          sessions,
          range.start,
          range.end,
          now,
        ),
      ),
    [intervals, sessions, ranges, now],
  );
};

export default useTrackedTimeTotalsForRanges;

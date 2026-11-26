import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useCountdownTimerStore } from "@/features/countdown-timer/stores/countdown-store";
import {
  useGetTotalFocusTime,
  useSessionHistoryStore,
} from "@/features/countdown-timer/stores/session-history-store";
import { useSessionStore } from "@/features/countdown-timer/stores/session-store";

describe("useGetTotalFocusTime", () => {
  beforeEach(() => {
    useCountdownTimerStore.setState({
      timerRunning: true,
      timerPaused: false,
      sessionProgressInSeconds: 150,
    });
    useSessionStore.setState({ currentSessionType: "Focus" });
  });

  it("does not add running progress to a past date range", () => {
    const now = Date.now();
    const dayInMilliseconds = 86400000;
    useSessionHistoryStore.setState({
      sessions: [
        {
          id: "past-focus-session",
          sessionType: "Focus",
          durationInSeconds: 600,
          completedAt: now - dayInMilliseconds - 1000,
        },
      ],
    });

    const { result } = renderHook(() =>
      useGetTotalFocusTime(
        now - 2 * dayInMilliseconds,
        now - dayInMilliseconds,
      ),
    );

    expect(result.current).toBe(600);
  });

  it("adds running progress to the date range that includes now", () => {
    useSessionHistoryStore.setState({ sessions: [] });
    const now = Date.now();

    const { result } = renderHook(() =>
      useGetTotalFocusTime(now - 86400000, now + 86400000),
    );

    expect(result.current).toBe(150);
  });
});

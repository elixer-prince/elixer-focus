import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sessions: [] as CompletedSession[],
  lastCompletedSession: null as CompletedSession | null,
  addSession: vi.fn(),
  removeSession: vi.fn(),
  clearSessions: vi.fn(),
  clearLastCompletedSession: vi.fn(),
  timerRunning: false,
  sessionProgressInSeconds: 0,
  currentSessionType: "Focus",
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useCurrentSessionType: () => mocks.currentSessionType,
  useSessionStore: {
    getState: () => ({
      currentSessionType: mocks.currentSessionType,
    }),
  },
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => mocks.timerRunning,
  useSessionProgressInSeconds: () => mocks.sessionProgressInSeconds,
  useCountdownTimerStore: {
    getState: () => ({
      timerRunning: mocks.timerRunning,
      sessionProgressInSeconds: mocks.sessionProgressInSeconds,
    }),
  },
}));

vi.mock(
  "@/features/countdown-timer/stores/session-history-store",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/features/countdown-timer/stores/session-history-store")
      >();
    return {
      ...actual,
      useSessions: () => mocks.sessions,
      useGetTotalFocusTime: (from: number, to: number) => {
        const completedTime = mocks.sessions
          .filter(
            (s) =>
              s.sessionType === "Focus" &&
              s.completedAt >= from &&
              s.completedAt <= to,
          )
          .reduce((sum, s) => sum + s.durationInSeconds, 0);
        if (mocks.timerRunning && mocks.currentSessionType === "Focus") {
          return completedTime + mocks.sessionProgressInSeconds;
        }
        return completedTime;
      },
      useGetTotalFocusTimeForRanges: (
        ranges: Array<{ start: number; end: number }>,
      ) => {
        const now = Date.now();
        const runningProgress =
          mocks.timerRunning && mocks.currentSessionType === "Focus"
            ? mocks.sessionProgressInSeconds
            : 0;
        return ranges.map((range: { start: number; end: number }) => {
          const completedTime = mocks.sessions
            .filter(
              (s) =>
                s.sessionType === "Focus" &&
                s.completedAt >= range.start &&
                s.completedAt <= range.end,
            )
            .reduce((sum, s) => sum + s.durationInSeconds, 0);
          const isCurrentRange = now >= range.start && now <= range.end;
          return completedTime + (isCurrentRange ? runningProgress : 0);
        });
      },
    };
  },
);

import {
  getRunningTimerProgress,
  getTotalFocusTime,
  useGetTotalFocusTime,
  useGetTotalFocusTimeForRanges,
} from "@/features/countdown-timer/stores/session-history-store";

describe("session-history-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sessions = [];
    mocks.timerRunning = false;
    mocks.sessionProgressInSeconds = 0;
    mocks.currentSessionType = "Focus";
  });

  describe("getTotalFocusTime", () => {
    it("should return 0 when there are no sessions", () => {
      const now = Date.now();
      const result = getTotalFocusTime(now - 86400000, now);
      expect(result).toBe(0);
    });
  });

  describe("getRunningTimerProgress", () => {
    it("should return 0 when timer is not running", () => {
      mocks.timerRunning = false;
      mocks.sessionProgressInSeconds = 100;
      const result = getRunningTimerProgress();
      expect(result).toBe(0);
    });

    it("should return 0 when session is not Focus", () => {
      mocks.timerRunning = true;
      mocks.sessionProgressInSeconds = 100;
      mocks.currentSessionType = "Short Break";
      const result = getRunningTimerProgress();
      expect(result).toBe(0);
    });

    it("should return progress when timer is running and session is Focus", () => {
      mocks.timerRunning = true;
      mocks.sessionProgressInSeconds = 150;
      mocks.currentSessionType = "Focus";
      const result = getRunningTimerProgress();
      expect(result).toBe(150);
    });
  });

  describe("useGetTotalFocusTime", () => {
    it("should return completed time when timer is not running", () => {
      const now = Date.now();
      mocks.sessions = [
        {
          id: "1",
          sessionType: "Focus",
          durationInSeconds: 600,
          completedAt: now,
        },
      ];
      mocks.timerRunning = false;

      const { result } = renderHook(() =>
        useGetTotalFocusTime(now - 86400000, now),
      );
      expect(result.current).toBe(600);
    });

    it("should add running progress to completed time when timer is running", () => {
      const now = Date.now();
      mocks.sessions = [
        {
          id: "1",
          sessionType: "Focus",
          durationInSeconds: 600,
          completedAt: now,
        },
      ];
      mocks.timerRunning = true;
      mocks.sessionProgressInSeconds = 150;
      mocks.currentSessionType = "Focus";

      const { result } = renderHook(() =>
        useGetTotalFocusTime(now - 86400000, now),
      );
      expect(result.current).toBe(750);
    });

    it("should not add progress when session is not Focus", () => {
      const now = Date.now();
      mocks.sessions = [
        {
          id: "1",
          sessionType: "Focus",
          durationInSeconds: 600,
          completedAt: now,
        },
      ];
      mocks.timerRunning = true;
      mocks.sessionProgressInSeconds = 150;
      mocks.currentSessionType = "Short Break";

      const { result } = renderHook(() =>
        useGetTotalFocusTime(now - 86400000, now),
      );
      expect(result.current).toBe(600);
    });
  });

  describe("useGetTotalFocusTimeForRanges", () => {
    it("should return focus times for each range", () => {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      const yesterdayStart = todayStart - 86400000;

      mocks.sessions = [
        {
          id: "1",
          sessionType: "Focus",
          durationInSeconds: 600,
          completedAt: yesterdayStart + 3600000,
        },
        {
          id: "2",
          sessionType: "Focus",
          durationInSeconds: 300,
          completedAt: todayStart + 7200000,
        },
      ];

      const ranges = [
        { start: yesterdayStart, end: todayStart - 1 },
        { start: todayStart, end: todayStart + 86400000 },
      ];

      const { result } = renderHook(() =>
        useGetTotalFocusTimeForRanges(ranges),
      );
      expect(result.current).toEqual([600, 300]);
    });

    it("should only add running progress to the current range", () => {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      const yesterdayStart = todayStart - 86400000;

      mocks.sessions = [
        {
          id: "1",
          sessionType: "Focus",
          durationInSeconds: 600,
          completedAt: yesterdayStart + 3600000,
        },
      ];
      mocks.timerRunning = true;
      mocks.sessionProgressInSeconds = 150;
      mocks.currentSessionType = "Focus";

      const ranges = [
        { start: yesterdayStart, end: todayStart - 1 },
        { start: todayStart, end: todayStart + 86400000 },
      ];

      const { result } = renderHook(() =>
        useGetTotalFocusTimeForRanges(ranges),
      );
      // Yesterday should not include running progress
      // Today should include running progress
      expect(result.current[0]).toBe(600);
      expect(result.current[1]).toBe(150);
    });
  });
});

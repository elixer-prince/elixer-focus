import { renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  timerRunning: false,
  timerPaused: true,
  setTimerRunning: vi.fn(),
  setTimerPaused: vi.fn(),
  setRemainingTimeInSeconds: vi.fn(),
  stopEndTicking: vi.fn(),
  autoSwitchSessionType: vi.fn(),
  timerEndTimeRef: { current: null as number | null },
  timerIntervalRef: { current: null as ReturnType<typeof setInterval> | null },
  isEndTickingRef: { current: false },
  clearIntervalIfItExists: vi.fn(),
  saveToLocalStorage: vi.fn(),
  getCurrentTimestamp: vi.fn(),
  convertMillisecondsToSeconds: vi.fn((ms: number) => ms / 1000),
}));

vi.mock("@/features/countdown-timer/hooks/useSessionSwitch", () => ({
  default: () => ({
    autoSwitchSessionType: mocks.autoSwitchSessionType,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useEndTicking", () => ({
  default: () => ({
    stopEndTicking: mocks.stopEndTicking,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerEndTimeRef: mocks.timerEndTimeRef,
    timerIntervalRef: mocks.timerIntervalRef,
    isEndTickingRef: mocks.isEndTickingRef,
  }),
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => mocks.timerRunning,
  useTimerPaused: () => mocks.timerPaused,
  useSetTimerRunning: () => mocks.setTimerRunning,
  useSetTimerPaused: () => mocks.setTimerPaused,
  useSetRemainingTimeInSeconds: () => mocks.setRemainingTimeInSeconds,
}));

vi.mock("@/utils/conversion", () => ({
  convertMillisecondsToSeconds: mocks.convertMillisecondsToSeconds,
}));

vi.mock("@/utils/date", () => ({
  getCurrentTimestamp: mocks.getCurrentTimestamp,
}));

vi.mock("@/utils/interval", () => ({
  clearIntervalIfItExists: mocks.clearIntervalIfItExists,
}));

vi.mock("@/utils/storage", () => ({
  saveToLocalStorage: mocks.saveToLocalStorage,
}));

import useCountdownHelpers from "@/features/countdown-timer/hooks/useCountdownHelpers";

describe("useCountdownHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerRunning = false;
    mocks.timerPaused = true;
    mocks.timerEndTimeRef.current = null;
    mocks.timerIntervalRef.current = null;
    mocks.isEndTickingRef.current = false;
  });

  describe("timerShouldNotBeActiveOnRefresh", () => {
    it("should return true when timer is not running", () => {
      mocks.timerRunning = false;
      mocks.timerPaused = true;

      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerShouldNotBeActiveOnRefresh()).toBe(true);
    });

    it("should return true when timer is paused", () => {
      mocks.timerRunning = true;
      mocks.timerPaused = true;

      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerShouldNotBeActiveOnRefresh()).toBe(true);
    });

    it("should return false when timer is running and not paused", () => {
      mocks.timerRunning = true;
      mocks.timerPaused = false;

      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerShouldNotBeActiveOnRefresh()).toBe(false);
    });
  });

  describe("timerShouldBeTickingOnRefresh", () => {
    it("should return true when remaining seconds is between 1 and 10", () => {
      mocks.isEndTickingRef.current = false;

      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerShouldBeTickingOnRefresh(10)).toBe(true);
      expect(result.current.timerShouldBeTickingOnRefresh(5)).toBe(true);
      expect(result.current.timerShouldBeTickingOnRefresh(1)).toBe(true);
    });

    it("should return false when remaining seconds is 0 or less", () => {
      mocks.isEndTickingRef.current = false;

      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerShouldBeTickingOnRefresh(0)).toBe(false);
      expect(result.current.timerShouldBeTickingOnRefresh(-1)).toBe(false);
    });

    it("should return false when remaining seconds is greater than 10", () => {
      mocks.isEndTickingRef.current = false;

      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerShouldBeTickingOnRefresh(11)).toBe(false);
      expect(result.current.timerShouldBeTickingOnRefresh(25)).toBe(false);
    });

    it("should return false when end ticking is already active", () => {
      mocks.isEndTickingRef.current = true;

      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerShouldBeTickingOnRefresh(5)).toBe(false);
    });
  });

  describe("timerEndedWhileAway", () => {
    it("should return true when remaining seconds is 0 or less", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerEndedWhileAway(0)).toBe(true);
      expect(result.current.timerEndedWhileAway(-5)).toBe(true);
    });

    it("should return false when remaining seconds is greater than 0", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.timerEndedWhileAway(1)).toBe(false);
      expect(result.current.timerEndedWhileAway(25)).toBe(false);
    });
  });

  describe("handleEndedTimerWhileAway", () => {
    it("should stop end ticking", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      result.current.handleEndedTimerWhileAway();

      expect(mocks.stopEndTicking).toHaveBeenCalled();
    });

    it("should set remaining time to 0", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      result.current.handleEndedTimerWhileAway();

      expect(mocks.setRemainingTimeInSeconds).toHaveBeenCalledWith(0);
    });

    it("should pause the timer", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      result.current.handleEndedTimerWhileAway();

      expect(mocks.setTimerPaused).toHaveBeenCalledWith(true);
    });

    it("should stop the timer from running", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      result.current.handleEndedTimerWhileAway();

      expect(mocks.setTimerRunning).toHaveBeenCalledWith(false);
    });

    it("should auto switch session", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      result.current.handleEndedTimerWhileAway();

      expect(mocks.autoSwitchSessionType).toHaveBeenCalled();
    });

    it("should clear the timer interval", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      result.current.handleEndedTimerWhileAway();

      expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
        mocks.timerIntervalRef,
      );
    });

    it("should remove stored end time", () => {
      const { result } = renderHook(() => useCountdownHelpers());

      result.current.handleEndedTimerWhileAway();

      expect(mocks.saveToLocalStorage).toHaveBeenCalledWith(
        "timerEndTime",
        null,
      );
    });
  });

  describe("calculateNewRemainingSeconds", () => {
    it("should return 0 when there is no stored end time", () => {
      mocks.timerEndTimeRef.current = null;

      const { result } = renderHook(() => useCountdownHelpers());

      expect(result.current.calculateNewRemainingSeconds(999999)).toBe(0);
    });

    it("should calculate remaining seconds from end time", () => {
      mocks.timerEndTimeRef.current = 100000;
      mocks.getCurrentTimestamp.mockReturnValue(1000);
      mocks.convertMillisecondsToSeconds.mockReturnValue(99);

      const { result } = renderHook(() => useCountdownHelpers());

      const remaining = result.current.calculateNewRemainingSeconds(100000);

      expect(remaining).toBe(99);
    });

    it("should never return a negative value", () => {
      mocks.timerEndTimeRef.current = 1000;
      mocks.getCurrentTimestamp.mockReturnValue(100000);
      mocks.convertMillisecondsToSeconds.mockReturnValue(-99);

      const { result } = renderHook(() => useCountdownHelpers());

      const remaining = result.current.calculateNewRemainingSeconds(1000);

      expect(remaining).toBe(0);
    });
  });
});

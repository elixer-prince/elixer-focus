import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  startEndTicking: vi.fn(),
  stopEndTicking: vi.fn(),
  runInterval: vi.fn(),
  calculateNewRemainingSeconds: vi.fn(),
  timerEndedWhileAway: vi.fn(),
  timerShouldBeTickingOnRefresh: vi.fn(),
  timerShouldNotBeActiveOnRefresh: vi.fn(),
  handleEndedTimerWhileAway: vi.fn(),
  setTimerRunning: vi.fn(),
  setTimerPaused: vi.fn(),
  setRemainingTimeInSeconds: vi.fn(),
  playSound: vi.fn(),
  saveToLocalStorage: vi.fn(),
  clearIntervalIfItExists: vi.fn(),
  calculateEndTime: vi.fn(),
  timerPausedValue: true,
  remainingTimeInSecondsValue: 1500,
  timerOnClickSoundEffectRef: { current: "timer-on-sound" as string | null },
  timerEndTimeRef: { current: null as number | null },
  timerIntervalRef: { current: 123 as number | null },
}));

vi.mock("@/features/countdown-timer/hooks/useEndTicking", () => ({
  default: () => ({
    startEndTicking: mocks.startEndTicking,
    stopEndTicking: mocks.stopEndTicking,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownInterval", () => ({
  default: () => ({
    runInterval: mocks.runInterval,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownHelpers", () => ({
  default: () => ({
    calculateNewRemainingSeconds: mocks.calculateNewRemainingSeconds,
    timerEndedWhileAway: mocks.timerEndedWhileAway,
    timerShouldBeTickingOnRefresh: mocks.timerShouldBeTickingOnRefresh,
    timerShouldNotBeActiveOnRefresh: mocks.timerShouldNotBeActiveOnRefresh,
    handleEndedTimerWhileAway: mocks.handleEndedTimerWhileAway,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerOnClickSoundEffectRef: mocks.timerOnClickSoundEffectRef,
    timerEndTimeRef: mocks.timerEndTimeRef,
    timerIntervalRef: mocks.timerIntervalRef,
  }),
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerPaused: () => mocks.timerPausedValue,
  useRemainingTimeInSeconds: () => mocks.remainingTimeInSecondsValue,
  useSetTimerRunning: () => mocks.setTimerRunning,
  useSetTimerPaused: () => mocks.setTimerPaused,
  useSetRemainingTimeInSeconds: () => mocks.setRemainingTimeInSeconds,
}));

vi.mock("@/features/countdown-timer/utils/calculations", () => ({
  calculateEndTime: mocks.calculateEndTime,
}));

vi.mock("@/utils/interval", () => ({
  clearIntervalIfItExists: mocks.clearIntervalIfItExists,
}));

vi.mock("@/utils/sound", () => ({
  playSound: mocks.playSound,
}));

vi.mock("@/utils/storage", () => ({
  saveToLocalStorage: mocks.saveToLocalStorage,
}));

import useStartCountdown from "@/features/countdown-timer/hooks/useStartCountdown";

describe("useStartCountdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerPausedValue = true;
    mocks.remainingTimeInSecondsValue = 1500;
    mocks.timerEndTimeRef.current = null;
    mocks.timerIntervalRef.current = 123;
    mocks.calculateEndTime.mockReturnValue(999999);
  });

  describe("startCountdown", () => {
    it("should start the countdown and persist end time", () => {
      const { result } = renderHook(() => useStartCountdown());

      act(() => {
        result.current.startCountdown();
      });

      expect(mocks.stopEndTicking).toHaveBeenCalled();
      expect(mocks.setTimerPaused).toHaveBeenCalledWith(false);
      expect(mocks.setTimerRunning).toHaveBeenCalledWith(true);
      expect(mocks.calculateEndTime).toHaveBeenCalledWith(1500);
      expect(mocks.timerEndTimeRef.current).toBe(999999);
      expect(mocks.saveToLocalStorage).toHaveBeenCalledWith(
        "timerEndTime",
        999999,
      );
      expect(mocks.runInterval).toHaveBeenCalledWith(999999);
    });
  });

  describe("startCountdownWithSound", () => {
    it("should do nothing if the timer is not paused", () => {
      mocks.timerPausedValue = false;
      const { result } = renderHook(() => useStartCountdown());

      act(() => {
        result.current.startCountdownWithSound();
      });

      expect(mocks.playSound).not.toHaveBeenCalled();
      expect(mocks.setTimerRunning).not.toHaveBeenCalled();
      expect(mocks.runInterval).not.toHaveBeenCalled();
    });

    it("should play sound and start the countdown when paused", () => {
      const { result } = renderHook(() => useStartCountdown());

      act(() => {
        result.current.startCountdownWithSound();
      });

      expect(mocks.playSound).toHaveBeenCalledWith("timer-on-sound");
      expect(mocks.setTimerRunning).toHaveBeenCalledWith(true);
      expect(mocks.runInterval).toHaveBeenCalledWith(999999);
    });
  });

  describe("startCountdownOnPageLoad", () => {
    it("should do nothing when timer should not be active on refresh", () => {
      mocks.timerShouldNotBeActiveOnRefresh.mockReturnValue(true);
      mocks.timerEndTimeRef.current = 1111;

      const { result } = renderHook(() => useStartCountdown());

      act(() => {
        result.current.startCountdownOnPageLoad();
      });

      expect(mocks.clearIntervalIfItExists).not.toHaveBeenCalled();
      expect(mocks.runInterval).not.toHaveBeenCalled();
    });

    it("should do nothing when there is no stored end time", () => {
      mocks.timerShouldNotBeActiveOnRefresh.mockReturnValue(false);
      mocks.timerEndTimeRef.current = null;

      const { result } = renderHook(() => useStartCountdown());

      act(() => {
        result.current.startCountdownOnPageLoad();
      });

      expect(mocks.clearIntervalIfItExists).not.toHaveBeenCalled();
      expect(mocks.runInterval).not.toHaveBeenCalled();
    });

    it("should handle timer ended while away", () => {
      mocks.timerShouldNotBeActiveOnRefresh.mockReturnValue(false);
      mocks.timerEndTimeRef.current = 2222;
      mocks.calculateNewRemainingSeconds.mockReturnValue(-1);
      mocks.timerEndedWhileAway.mockReturnValue(true);

      const { result } = renderHook(() => useStartCountdown());

      act(() => {
        result.current.startCountdownOnPageLoad();
      });

      expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
        mocks.timerIntervalRef,
      );
      expect(mocks.handleEndedTimerWhileAway).toHaveBeenCalled();
      expect(mocks.runInterval).not.toHaveBeenCalled();
    });

    it("should resume the countdown and optionally start end ticking", () => {
      mocks.timerShouldNotBeActiveOnRefresh.mockReturnValue(false);
      mocks.timerEndTimeRef.current = 3333;
      mocks.calculateNewRemainingSeconds.mockReturnValue(8);
      mocks.timerShouldBeTickingOnRefresh.mockReturnValue(true);
      mocks.timerEndedWhileAway.mockReturnValue(false);

      const { result } = renderHook(() => useStartCountdown());

      act(() => {
        result.current.startCountdownOnPageLoad();
      });

      expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
        mocks.timerIntervalRef,
      );
      expect(mocks.startEndTicking).toHaveBeenCalled();
      expect(mocks.setRemainingTimeInSeconds).toHaveBeenCalledWith(8);
      expect(mocks.runInterval).toHaveBeenCalledWith(3333);
    });
  });
});

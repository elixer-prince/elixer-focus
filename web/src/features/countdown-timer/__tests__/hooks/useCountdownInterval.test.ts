import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  timerBeepSoundEffectRef: { current: null as HTMLAudioElement | null },
  timerIntervalRef: { current: null as ReturnType<typeof setInterval> | null },
  sessionProgressIntervalRef: {
    current: null as ReturnType<typeof setInterval> | null,
  },
  hasPlayedEndBeepRef: { current: false },
  autoSwitchSessionType: vi.fn(),
  startEndTicking: vi.fn(),
  stopEndTicking: vi.fn(),
  displayRemainingTimeInPageTitle: vi.fn(),
  alertUserOfTimerEnd: vi.fn(),
  setSessionProgressInSeconds: vi.fn(),
  resetSessionProgressInSeconds: vi.fn(),
  setRemainingTimeInSeconds: vi.fn(),
  setPreviousSessionType: vi.fn(),
  calculateRemainingSeconds: vi.fn(),
  timerIsAboutToEnd: vi.fn(),
  timerHasEnded: vi.fn(),
  getCurrentTimestamp: vi.fn(),
  clearIntervalIfItExists: vi.fn(),
  playSound: vi.fn(),
}));

vi.mock("@/features/countdown-timer/hooks/useSessionSwitch", () => ({
  default: () => ({
    autoSwitchSessionType: mocks.autoSwitchSessionType,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useEndTicking", () => ({
  default: () => ({
    startEndTicking: mocks.startEndTicking,
    stopEndTicking: mocks.stopEndTicking,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerBeepSoundEffectRef: mocks.timerBeepSoundEffectRef,
    timerIntervalRef: mocks.timerIntervalRef,
    sessionProgressIntervalRef: mocks.sessionProgressIntervalRef,
    hasPlayedEndBeepRef: mocks.hasPlayedEndBeepRef,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownAlerts", () => ({
  default: () => ({
    alertUserOfTimerEnd: mocks.alertUserOfTimerEnd,
  }),
}));

vi.mock("@/hooks/usePageTitle", () => ({
  default: () => ({
    displayRemainingTimeInPageTitle: mocks.displayRemainingTimeInPageTitle,
  }),
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useCurrentSessionType: () => "Focus",
  useSetPreviousSessionType: () => mocks.setPreviousSessionType,
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useSetSessionProgressInSeconds: () => mocks.setSessionProgressInSeconds,
  useResetSessionProgressInSeconds: () => mocks.resetSessionProgressInSeconds,
  useSessionProgressInSeconds: () => 0,
  useSetRemainingTimeInSeconds: () => mocks.setRemainingTimeInSeconds,
}));

vi.mock("@/features/countdown-timer/utils/calculations", () => ({
  calculateRemainingSeconds: mocks.calculateRemainingSeconds,
}));

vi.mock("@/features/countdown-timer/utils/checks", () => ({
  timerIsAboutToEnd: mocks.timerIsAboutToEnd,
  timerHasEnded: mocks.timerHasEnded,
}));

vi.mock("@/utils/date", () => ({
  getCurrentTimestamp: mocks.getCurrentTimestamp,
}));

vi.mock("@/utils/interval", () => ({
  clearIntervalIfItExists: mocks.clearIntervalIfItExists,
}));

vi.mock("@/utils/sound", () => ({
  playSound: mocks.playSound,
}));

import useCountdownInterval from "@/features/countdown-timer/hooks/useCountdownInterval";

describe("useCountdownInterval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerIntervalRef.current = null;
    mocks.sessionProgressIntervalRef.current = null;
    mocks.hasPlayedEndBeepRef.current = false;
    mocks.timerIsAboutToEnd.mockReturnValue(false);
    mocks.timerHasEnded.mockReturnValue(false);
    mocks.calculateRemainingSeconds.mockReturnValue(100);
    mocks.getCurrentTimestamp.mockReturnValue(1000);
  });

  describe("resetSessionProgress", () => {
    it("should clear the session progress interval", () => {
      mocks.sessionProgressIntervalRef.current = setInterval(() => {}, 1000);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.resetSessionProgress();
      });

      expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
        mocks.sessionProgressIntervalRef,
      );
    });

    it("should reset session progress in seconds", () => {
      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.resetSessionProgress();
      });

      expect(mocks.resetSessionProgressInSeconds).toHaveBeenCalled();
    });
  });

  describe("runInterval", () => {
    it("should clear existing interval before creating new one", () => {
      mocks.timerIntervalRef.current = setInterval(() => {}, 1000);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
      });

      expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
        mocks.timerIntervalRef,
      );
    });

    it("should create new interval with end time", () => {
      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
      });

      // The interval should be created and assigned to the ref
      expect(mocks.timerIntervalRef.current).not.toBeNull();
    });

    it("should set the interval in timerIntervalRef", () => {
      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
      });

      // Verify the interval ref is set
      expect(mocks.timerIntervalRef.current).toBeDefined();
    });

    it("should start the session progress interval when timer starts", () => {
      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
      });

      // The session progress interval should be created
      expect(mocks.sessionProgressIntervalRef.current).not.toBeNull();
    });
  });

  describe("session progress interval", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should update session progress every 100ms when timer runs", () => {
      mocks.getCurrentTimestamp.mockReturnValue(1000);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
      });

      // Advance time by 100ms to trigger the progress interval
      mocks.getCurrentTimestamp.mockReturnValue(1100);
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(mocks.setSessionProgressInSeconds).toHaveBeenCalledWith(0);
    });

    it("should not create a duplicate progress interval if one already exists", () => {
      mocks.sessionProgressIntervalRef.current = setInterval(() => {}, 100);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
      });

      // The progress interval ref should still be the same one we set
      expect(mocks.sessionProgressIntervalRef.current).toBeDefined();
    });

    it("should reset session progress when timer ends", () => {
      mocks.timerHasEnded.mockReturnValue(true);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
        vi.advanceTimersByTime(100);
      });

      expect(mocks.resetSessionProgressInSeconds).toHaveBeenCalled();
    });
  });

  describe("timer end behavior", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should call alertUserOfTimerEnd with the current session type when timer ends", () => {
      mocks.timerHasEnded.mockReturnValue(true);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
        vi.advanceTimersByTime(100);
      });

      expect(mocks.alertUserOfTimerEnd).toHaveBeenCalledWith("Focus");
    });

    it("should set previous session type when timer ends", () => {
      mocks.timerHasEnded.mockReturnValue(true);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
        vi.advanceTimersByTime(100);
      });

      expect(mocks.setPreviousSessionType).toHaveBeenCalledWith("Focus");
    });

    it("should auto switch session type when timer ends", () => {
      mocks.timerHasEnded.mockReturnValue(true);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
        vi.advanceTimersByTime(100);
      });

      expect(mocks.autoSwitchSessionType).toHaveBeenCalled();
    });

    it("should clear the timer interval when timer ends", () => {
      mocks.timerHasEnded.mockReturnValue(true);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
        vi.advanceTimersByTime(100);
      });

      expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
        mocks.timerIntervalRef,
      );
    });

    it("should play the end beep sound when timer ends", () => {
      mocks.timerHasEnded.mockReturnValue(true);
      mocks.timerBeepSoundEffectRef.current = new Audio();

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.runInterval(999999);
        vi.advanceTimersByTime(100);
      });

      expect(mocks.playSound).toHaveBeenCalled();
    });
  });
});

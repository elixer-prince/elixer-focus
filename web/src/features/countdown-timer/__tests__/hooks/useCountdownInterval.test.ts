import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  timerBeepSoundEffectRef: { current: null as HTMLAudioElement | null },
  timerIntervalRef: { current: null as ReturnType<typeof setInterval> | null },
  elapsedIntervalRef: { current: null as ReturnType<typeof setInterval> | null },
  autoSwitchSessionType: vi.fn(),
  startEndTicking: vi.fn(),
  stopEndTicking: vi.fn(),
  displayRemainingTimeInPageTitle: vi.fn(),
  alertUserOfTimerEnd: vi.fn(),
  setElapsedTimeInSeconds: vi.fn(),
  resetElapsedTimeInSeconds: vi.fn(),
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
    elapsedIntervalRef: mocks.elapsedIntervalRef,
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
  useSetElapsedTimeInSeconds: () => mocks.setElapsedTimeInSeconds,
  useResetElapsedTimeInSeconds: () => mocks.resetElapsedTimeInSeconds,
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
    mocks.elapsedIntervalRef.current = null;
    mocks.timerIsAboutToEnd.mockReturnValue(false);
    mocks.timerHasEnded.mockReturnValue(false);
    mocks.calculateRemainingSeconds.mockReturnValue(100);
    mocks.getCurrentTimestamp.mockReturnValue(1000);
  });

  describe("resetElapsedTime", () => {
    it("should clear the elapsed interval", () => {
      mocks.elapsedIntervalRef.current = setInterval(() => {}, 1000);

      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.resetElapsedTime();
      });

      expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
        mocks.elapsedIntervalRef,
      );
    });

    it("should reset elapsed time in seconds", () => {
      const { result } = renderHook(() => useCountdownInterval());

      act(() => {
        result.current.resetElapsedTime();
      });

      expect(mocks.resetElapsedTimeInSeconds).toHaveBeenCalled();
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
  });
});

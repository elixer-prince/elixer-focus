import { render, renderHook } from "@testing-library/react";
import { createElement, useLayoutEffect } from "react";

const mocks = vi.hoisted(() => ({
  startCountdownOnPageLoad: vi.fn(),
  stopEndTicking: vi.fn(),
  clearIntervalIfItExists: vi.fn(),
  timerRunning: true,
  timerPaused: false,
  storedEndTime: 5000,
  timerEndTimeRef: { current: null as number | null },
  timerIntervalRef: { current: null as number | null },
  sessionProgressIntervalRef: { current: null as number | null },
}));

vi.mock("@/features/countdown-timer/hooks/useStartCountdown", () => ({
  default: () => ({
    startCountdownOnPageLoad: mocks.startCountdownOnPageLoad,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useEndTicking", () => ({
  default: () => ({
    stopEndTicking: mocks.stopEndTicking,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useTimerCoordinator", () => ({
  default: () => ({ ready: true, supported: true, isCoordinator: true }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerEndTimeRef: mocks.timerEndTimeRef,
    timerIntervalRef: mocks.timerIntervalRef,
    sessionProgressIntervalRef: mocks.sessionProgressIntervalRef,
  }),
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => mocks.timerRunning,
  useTimerPaused: () => mocks.timerPaused,
}));

vi.mock("@/features/countdown-timer/hooks/usePreventTabThrottling", () => ({
  default: vi.fn(),
}));

vi.mock("@/utils/interval", () => ({
  clearIntervalIfItExists: mocks.clearIntervalIfItExists,
}));

vi.mock("@/utils/storage", () => ({
  getFromLocalStorage: () => mocks.storedEndTime,
}));

import useCountdownTimer from "@/features/countdown-timer/hooks/useCountdownTimer";

describe("useCountdownTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerRunning = true;
    mocks.timerPaused = false;
    mocks.storedEndTime = 5000;
    mocks.timerEndTimeRef.current = null;
    mocks.timerIntervalRef.current = null;
  });

  it("should call startCountdownOnPageLoad on mount", () => {
    renderHook(() => useCountdownTimer());

    expect(mocks.startCountdownOnPageLoad).toHaveBeenCalled();
  });

  it("should restore the timer before the browser can paint", () => {
    let restoredBeforePaint = false;

    const Timer = () => {
      useCountdownTimer();
      return null;
    };

    const App = () => {
      useLayoutEffect(() => {
        restoredBeforePaint =
          mocks.startCountdownOnPageLoad.mock.calls.length > 0;
      }, []);

      return createElement(Timer);
    };

    render(createElement(App));

    expect(restoredBeforePaint).toBe(true);
  });

  it("should call cleanup functions on unmount", () => {
    mocks.timerIntervalRef.current = 42;

    const { unmount } = renderHook(() => useCountdownTimer());

    unmount();

    expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
      mocks.timerIntervalRef,
    );
    expect(mocks.stopEndTicking).toHaveBeenCalled();
  });

  it("should not call cleanup if already cleaned up", () => {
    const { unmount } = renderHook(() => useCountdownTimer());

    unmount();
    unmount();

    expect(mocks.stopEndTicking).toHaveBeenCalledTimes(1);
  });
});

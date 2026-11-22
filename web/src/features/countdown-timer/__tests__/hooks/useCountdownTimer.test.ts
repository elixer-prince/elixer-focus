import { renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  startCountdownOnPageLoad: vi.fn(),
  stopEndTicking: vi.fn(),
  clearIntervalIfItExists: vi.fn(),
  timerIntervalRef: { current: null as number | null },
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

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerIntervalRef: mocks.timerIntervalRef,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/usePreventTabThrottling", () => ({
  default: vi.fn(),
}));

vi.mock("@/utils/interval", () => ({
  clearIntervalIfItExists: mocks.clearIntervalIfItExists,
}));

import useCountdownTimer from "@/features/countdown-timer/hooks/useCountdownTimer";

describe("useCountdownTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerIntervalRef.current = null;
  });

  it("should call startCountdownOnPageLoad on mount", () => {
    renderHook(() => useCountdownTimer());

    expect(mocks.startCountdownOnPageLoad).toHaveBeenCalled();
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

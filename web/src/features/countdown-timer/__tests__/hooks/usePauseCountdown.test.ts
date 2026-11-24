import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  playSoundMock: vi.fn(),
  clearIntervalIfItExistsMock: vi.fn(),
  setTimerPausedMock: vi.fn(),
  timerIntervalRef: { current: 123 as number | null },
  timerEndTimeRef: { current: 999999 as number | null },
  timerOffClickSoundEffectRef: { current: "timer-off-sound" as string | null },
  timerPausedValue: false,
  remainingTimeInSeconds: 210,
  saveToLocalStorageMock: vi.fn(),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerOffClickSoundEffectRef: mocks.timerOffClickSoundEffectRef,
    timerIntervalRef: mocks.timerIntervalRef,
    timerEndTimeRef: mocks.timerEndTimeRef,
  }),
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerPaused: () => mocks.timerPausedValue,
  useRemainingTimeInSeconds: () => mocks.remainingTimeInSeconds,
  useSetTimerPaused: () => mocks.setTimerPausedMock,
}));

vi.mock("@/utils/interval", () => ({
  clearIntervalIfItExists: mocks.clearIntervalIfItExistsMock,
}));

vi.mock("@/utils/sound", () => ({
  playSound: mocks.playSoundMock,
}));

vi.mock("@/utils/storage", () => ({
  saveToLocalStorage: mocks.saveToLocalStorageMock,
}));

import usePauseCountdown from "@/features/countdown-timer/hooks/usePauseCountdown";

describe("usePauseCountdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerPausedValue = false;
    mocks.timerIntervalRef.current = 123;
    mocks.timerEndTimeRef.current = 999999;
    mocks.remainingTimeInSeconds = 210;
  });

  it("should do nothing when the timer is already paused", () => {
    mocks.timerPausedValue = true;

    const { result } = renderHook(() => usePauseCountdown());

    act(() => {
      result.current.pauseCountdown();
    });

    expect(mocks.playSoundMock).not.toHaveBeenCalled();
    expect(mocks.setTimerPausedMock).not.toHaveBeenCalled();
    expect(mocks.clearIntervalIfItExistsMock).not.toHaveBeenCalled();
  });

  it("should pause the timer and clear the interval when running", () => {
    const { result } = renderHook(() => usePauseCountdown());

    act(() => {
      result.current.pauseCountdown();
    });

    expect(mocks.playSoundMock).toHaveBeenCalledWith("timer-off-sound");
    expect(mocks.setTimerPausedMock).toHaveBeenCalledWith(true);
    expect(mocks.clearIntervalIfItExistsMock).toHaveBeenCalledWith(
      mocks.timerIntervalRef,
    );
    expect(mocks.timerEndTimeRef.current).toBeNull();
    expect(mocks.saveToLocalStorageMock).toHaveBeenCalledWith(
      "timerPausedRemainingTime",
      210,
    );
    expect(mocks.saveToLocalStorageMock).toHaveBeenCalledWith(
      "timerEndTime",
      null,
    );
  });
});

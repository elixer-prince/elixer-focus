import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  timerIntervalRef: { current: null as ReturnType<typeof setInterval> | null },
  timerEndTimeRef: { current: null as number | null },
  setTimerRunning: vi.fn(),
  setTimerPaused: vi.fn(),
  setStartTimeInMinutes: vi.fn(),
  setRemainingTimeInSeconds: vi.fn(),
  saveToLocalStorage: vi.fn(),
  convertMinutesToSeconds: vi.fn((minutes: number) => minutes * 60),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerIntervalRef: mocks.timerIntervalRef,
    timerEndTimeRef: mocks.timerEndTimeRef,
  }),
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useSetTimerRunning: () => mocks.setTimerRunning,
  useSetTimerPaused: () => mocks.setTimerPaused,
  useSetStartTimeInMinutes: () => mocks.setStartTimeInMinutes,
  useSetRemainingTimeInSeconds: () => mocks.setRemainingTimeInSeconds,
}));

vi.mock("@/utils/conversion", () => ({
  convertMinutesToSeconds: mocks.convertMinutesToSeconds,
}));

vi.mock("@/utils/storage", () => ({
  saveToLocalStorage: mocks.saveToLocalStorage,
}));

import useCountdownStorage from "@/features/countdown-timer/hooks/useCountdownStorage";

describe("useCountdownStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerIntervalRef.current = null;
    mocks.timerEndTimeRef.current = null;
  });

  describe("resetTimerStorage", () => {
    it("should clear the timer interval if it exists", () => {
      mocks.timerIntervalRef.current = setInterval(() => {}, 1000);

      const { result } = renderHook(() => useCountdownStorage());

      act(() => {
        result.current.resetTimerStorage(25);
      });

      // The interval should be cleared
      expect(mocks.timerIntervalRef.current).toBeNull();
    });

    it("should set timer running to false", () => {
      const { result } = renderHook(() => useCountdownStorage());

      act(() => {
        result.current.resetTimerStorage(25);
      });

      expect(mocks.setTimerRunning).toHaveBeenCalledWith(false);
    });

    it("should set timer paused to true", () => {
      const { result } = renderHook(() => useCountdownStorage());

      act(() => {
        result.current.resetTimerStorage(25);
      });

      expect(mocks.setTimerPaused).toHaveBeenCalledWith(true);
    });

    it("should clear the end time ref", () => {
      mocks.timerEndTimeRef.current = 999999;

      const { result } = renderHook(() => useCountdownStorage());

      act(() => {
        result.current.resetTimerStorage(25);
      });

      expect(mocks.timerEndTimeRef.current).toBeNull();
    });

    it("should save null to localStorage for timerEndTime", () => {
      const { result } = renderHook(() => useCountdownStorage());

      act(() => {
        result.current.resetTimerStorage(25);
      });

      expect(mocks.saveToLocalStorage).toHaveBeenCalledWith(
        "timerEndTime",
        null,
      );
    });

    it("should set start time in minutes", () => {
      const { result } = renderHook(() => useCountdownStorage());

      act(() => {
        result.current.resetTimerStorage(25);
      });

      expect(mocks.setStartTimeInMinutes).toHaveBeenCalledWith(25);
    });

    it("should convert and set remaining time in seconds", () => {
      mocks.convertMinutesToSeconds.mockReturnValue(1500);

      const { result } = renderHook(() => useCountdownStorage());

      act(() => {
        result.current.resetTimerStorage(25);
      });

      expect(mocks.convertMinutesToSeconds).toHaveBeenCalledWith(25);
      expect(mocks.setRemainingTimeInSeconds).toHaveBeenCalledWith(1500);
    });
  });
});

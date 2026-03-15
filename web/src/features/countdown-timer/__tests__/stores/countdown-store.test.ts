import { act, renderHook } from "@testing-library/react";

const loadStore = async () => {
  localStorage.clear();
  vi.resetModules();
  return await import("@/features/countdown-timer/stores/countdown-store");
};

describe("Countdown Timer Store", () => {
  it("should expose the default countdown state", async () => {
    const {
      useTimerRunning,
      useTimerPaused,
      useRemainingTimeInSeconds,
      useStartTimeInMinutes,
      useElapsedTimeInSeconds,
    } = await loadStore();

    expect(renderHook(() => useTimerRunning()).result.current).toBe(false);
    expect(renderHook(() => useTimerPaused()).result.current).toBe(true);
    expect(renderHook(() => useRemainingTimeInSeconds()).result.current).toBe(
      1500,
    );
    expect(renderHook(() => useStartTimeInMinutes()).result.current).toBe(25);
    expect(renderHook(() => useElapsedTimeInSeconds()).result.current).toBe(0);
  });

  it("should update countdown state values", async () => {
    const {
      useTimerRunning,
      useTimerPaused,
      useRemainingTimeInSeconds,
      useStartTimeInMinutes,
      useElapsedTimeInSeconds,
      useSetTimerRunning,
      useSetTimerPaused,
      useSetRemainingTimeInSeconds,
      useSetStartTimeInMinutes,
      useSetElapsedTimeInSeconds,
    } = await loadStore();

    const timerRunning = renderHook(() => useTimerRunning()).result;
    const timerPaused = renderHook(() => useTimerPaused()).result;
    const remainingTimeInSeconds = renderHook(
      () => useRemainingTimeInSeconds(),
    ).result;
    const startTimeInMinutes = renderHook(() => useStartTimeInMinutes()).result;
    const elapsedTimeInSeconds = renderHook(
      () => useElapsedTimeInSeconds(),
    ).result;

    const setTimerRunning = renderHook(() => useSetTimerRunning()).result;
    const setTimerPaused = renderHook(() => useSetTimerPaused()).result;
    const setRemainingTimeInSeconds = renderHook(
      () => useSetRemainingTimeInSeconds(),
    ).result;
    const setStartTimeInMinutes = renderHook(
      () => useSetStartTimeInMinutes(),
    ).result;
    const setElapsedTimeInSeconds = renderHook(
      () => useSetElapsedTimeInSeconds(),
    ).result;

    act(() => {
      setTimerRunning.current(true);
      setTimerPaused.current(false);
      setRemainingTimeInSeconds.current(123);
      setStartTimeInMinutes.current(12);
      setElapsedTimeInSeconds.current(45);
    });

    expect(timerRunning.current).toBe(true);
    expect(timerPaused.current).toBe(false);
    expect(remainingTimeInSeconds.current).toBe(123);
    expect(startTimeInMinutes.current).toBe(12);
    expect(elapsedTimeInSeconds.current).toBe(45);
  });

  it("should reset elapsed time", async () => {
    const {
      useElapsedTimeInSeconds,
      useSetElapsedTimeInSeconds,
      useResetElapsedTimeInSeconds,
    } = await loadStore();

    const elapsedTimeInSeconds = renderHook(
      () => useElapsedTimeInSeconds(),
    ).result;
    const setElapsedTimeInSeconds = renderHook(
      () => useSetElapsedTimeInSeconds(),
    ).result;
    const resetElapsedTimeInSeconds = renderHook(
      () => useResetElapsedTimeInSeconds(),
    ).result;

    act(() => {
      setElapsedTimeInSeconds.current(99);
    });

    expect(elapsedTimeInSeconds.current).toBe(99);

    act(() => {
      resetElapsedTimeInSeconds.current();
    });

    expect(elapsedTimeInSeconds.current).toBe(0);
  });
});

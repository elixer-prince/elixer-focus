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
      useSessionProgressInSeconds,
    } = await loadStore();

    expect(renderHook(() => useTimerRunning()).result.current).toBe(false);
    expect(renderHook(() => useTimerPaused()).result.current).toBe(true);
    expect(renderHook(() => useRemainingTimeInSeconds()).result.current).toBe(
      1500,
    );
    expect(renderHook(() => useStartTimeInMinutes()).result.current).toBe(25);
    expect(renderHook(() => useSessionProgressInSeconds()).result.current).toBe(
      0,
    );
  });

  it("should update countdown state values", async () => {
    const {
      useTimerRunning,
      useTimerPaused,
      useRemainingTimeInSeconds,
      useStartTimeInMinutes,
      useSessionProgressInSeconds,
      useSetTimerRunning,
      useSetTimerPaused,
      useSetRemainingTimeInSeconds,
      useSetStartTimeInMinutes,
      useSetSessionProgressInSeconds,
    } = await loadStore();

    const timerRunning = renderHook(() => useTimerRunning()).result;
    const timerPaused = renderHook(() => useTimerPaused()).result;
    const remainingTimeInSeconds = renderHook(() =>
      useRemainingTimeInSeconds(),
    ).result;
    const startTimeInMinutes = renderHook(() => useStartTimeInMinutes()).result;
    const sessionProgressInSeconds = renderHook(() =>
      useSessionProgressInSeconds(),
    ).result;

    const setTimerRunning = renderHook(() => useSetTimerRunning()).result;
    const setTimerPaused = renderHook(() => useSetTimerPaused()).result;
    const setRemainingTimeInSeconds = renderHook(() =>
      useSetRemainingTimeInSeconds(),
    ).result;
    const setStartTimeInMinutes = renderHook(() =>
      useSetStartTimeInMinutes(),
    ).result;
    const setSessionProgressInSeconds = renderHook(() =>
      useSetSessionProgressInSeconds(),
    ).result;

    act(() => {
      setTimerRunning.current(true);
      setTimerPaused.current(false);
      setRemainingTimeInSeconds.current(123);
      setStartTimeInMinutes.current(12);
      setSessionProgressInSeconds.current(45);
    });

    expect(timerRunning.current).toBe(true);
    expect(timerPaused.current).toBe(false);
    expect(remainingTimeInSeconds.current).toBe(123);
    expect(startTimeInMinutes.current).toBe(12);
    expect(sessionProgressInSeconds.current).toBe(45);
  });

  it("should reset session progress", async () => {
    const {
      useSessionProgressInSeconds,
      useSetSessionProgressInSeconds,
      useResetSessionProgressInSeconds,
    } = await loadStore();

    const sessionProgressInSeconds = renderHook(() =>
      useSessionProgressInSeconds(),
    ).result;
    const setSessionProgressInSeconds = renderHook(() =>
      useSetSessionProgressInSeconds(),
    ).result;
    const resetSessionProgressInSeconds = renderHook(() =>
      useResetSessionProgressInSeconds(),
    ).result;

    act(() => {
      setSessionProgressInSeconds.current(99);
    });

    expect(sessionProgressInSeconds.current).toBe(99);

    act(() => {
      resetSessionProgressInSeconds.current();
    });

    expect(sessionProgressInSeconds.current).toBe(0);
  });

  describe("persist configuration", () => {
    it("should declare version 3 in the persist config", async () => {
      const { useSetStartTimeInMinutes } = await loadStore();

      const setStartTimeInMinutes = renderHook(() =>
        useSetStartTimeInMinutes(),
      ).result;

      act(() => {
        setStartTimeInMinutes.current(20);
      });

      const stored = localStorage.getItem("countdown-timer-storage");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(3);
    });

    it("should include the countdown state in the persisted data", async () => {
      const { useSetStartTimeInMinutes } = await loadStore();

      const setStartTimeInMinutes = renderHook(() =>
        useSetStartTimeInMinutes(),
      ).result;

      act(() => {
        setStartTimeInMinutes.current(20);
      });

      const stored = localStorage.getItem("countdown-timer-storage");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state).toHaveProperty("startTimeInMinutes");
    });

    it("should restore countdown state from localStorage on reload", async () => {
      localStorage.clear();
      vi.resetModules();

      const firstStore = await import(
        "@/features/countdown-timer/stores/countdown-store"
      );

      const setStartTime = renderHook(() =>
        firstStore.useSetStartTimeInMinutes(),
      ).result;

      act(() => {
        setStartTime.current(20);
      });

      const stored = localStorage.getItem("countdown-timer-storage");
      expect(stored).not.toBeNull();

      vi.resetModules();
      const reloadedStore = await import(
        "@/features/countdown-timer/stores/countdown-store"
      );

      expect(
        renderHook(() => reloadedStore.useStartTimeInMinutes()).result.current,
      ).toBe(20);
    });
  });
});

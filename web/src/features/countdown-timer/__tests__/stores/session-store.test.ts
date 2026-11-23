import { act, renderHook } from "@testing-library/react";

const loadStore = async () => {
  localStorage.clear();
  vi.resetModules();
  return await import("@/features/countdown-timer/stores/session-store");
};

describe("Session Store", () => {
  it("should expose the default session state", async () => {
    const {
      useFocusDuration,
      useShortBreakDuration,
      useLongBreakDuration,
      useSessionCountLimit,
      useCurrentSessionType,
      usePreviousSessionType,
      useCurrentSessionCount,
      useTotalSessionsCompleted,
    } = await loadStore();

    expect(renderHook(() => useFocusDuration()).result.current).toBe(25);
    expect(renderHook(() => useShortBreakDuration()).result.current).toBe(5);
    expect(renderHook(() => useLongBreakDuration()).result.current).toBe(15);
    expect(renderHook(() => useSessionCountLimit()).result.current).toBe(4);
    expect(renderHook(() => useCurrentSessionType()).result.current).toBe(
      "Focus",
    );
    expect(renderHook(() => usePreviousSessionType()).result.current).toBe(
      null,
    );
    expect(renderHook(() => useCurrentSessionCount()).result.current).toBe(0);
    expect(renderHook(() => useTotalSessionsCompleted()).result.current).toBe(
      0,
    );
  });

  it("should update the session durations", async () => {
    const {
      useSetFocusDuration,
      useSetShortBreakDuration,
      useSetLongBreakDuration,
      useFocusDuration,
      useShortBreakDuration,
      useLongBreakDuration,
    } = await loadStore();

    const focusDuration = renderHook(() => useFocusDuration()).result;
    const shortBreakDuration = renderHook(() => useShortBreakDuration()).result;
    const longBreakDuration = renderHook(() => useLongBreakDuration()).result;

    const setFocusDuration = renderHook(() => useSetFocusDuration()).result;
    const setShortBreakDuration = renderHook(() =>
      useSetShortBreakDuration(),
    ).result;
    const setLongBreakDuration = renderHook(() =>
      useSetLongBreakDuration(),
    ).result;

    act(() => {
      setFocusDuration.current(30);
      setShortBreakDuration.current(8);
      setLongBreakDuration.current(20);
    });

    expect(focusDuration.current).toBe(30);
    expect(shortBreakDuration.current).toBe(8);
    expect(longBreakDuration.current).toBe(20);
  });

  it("should update session options and types", async () => {
    const {
      useSetSessionCountLimit,
      useSetCurrentSessionType,
      useSetPreviousSessionType,
      useSessionCountLimit,
      useCurrentSessionType,
      usePreviousSessionType,
    } = await loadStore();

    const sessionCountLimit = renderHook(() => useSessionCountLimit()).result;
    const currentSessionType = renderHook(() => useCurrentSessionType()).result;
    const previousSessionType = renderHook(() =>
      usePreviousSessionType(),
    ).result;

    const setSessionCountLimit = renderHook(() =>
      useSetSessionCountLimit(),
    ).result;
    const setCurrentSessionType = renderHook(() =>
      useSetCurrentSessionType(),
    ).result;
    const setPreviousSessionType = renderHook(() =>
      useSetPreviousSessionType(),
    ).result;

    act(() => {
      setSessionCountLimit.current(6);
      setCurrentSessionType.current("Short Break");
      setPreviousSessionType.current("Focus");
    });

    expect(sessionCountLimit.current).toBe(6);
    expect(currentSessionType.current).toBe("Short Break");
    expect(previousSessionType.current).toBe("Focus");
  });

  it("should track the session counters", async () => {
    const {
      useCurrentSessionCount,
      useIncrementCurrentSessionCount,
      useResetCurrentSessionCount,
      useTotalSessionsCompleted,
      useSetTotalSessionsCompleted,
    } = await loadStore();

    const currentSessionCount = renderHook(() =>
      useCurrentSessionCount(),
    ).result;
    const totalSessionsCompleted = renderHook(() =>
      useTotalSessionsCompleted(),
    ).result;

    const incrementCurrentSessionCount = renderHook(() =>
      useIncrementCurrentSessionCount(),
    ).result;
    const resetCurrentSessionCount = renderHook(() =>
      useResetCurrentSessionCount(),
    ).result;
    const setTotalSessionsCompleted = renderHook(() =>
      useSetTotalSessionsCompleted(),
    ).result;

    act(() => {
      incrementCurrentSessionCount.current();
      incrementCurrentSessionCount.current();
    });

    expect(currentSessionCount.current).toBe(2);

    act(() => {
      resetCurrentSessionCount.current();
    });

    expect(currentSessionCount.current).toBe(0);

    act(() => {
      setTotalSessionsCompleted.current(9);
    });

    expect(totalSessionsCompleted.current).toBe(9);
  });

  describe("persist configuration", () => {
    it("should declare version 1 in the persist config", async () => {
      const { useFocusDuration, useSetFocusDuration } = await loadStore();

      const setFocusDuration = renderHook(() => useSetFocusDuration()).result;

      act(() => {
        setFocusDuration.current(30);
      });

      const stored = localStorage.getItem("session-storage");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(1);
    });

    it("should include the session state in the persisted data", async () => {
      const { useFocusDuration, useSetFocusDuration } = await loadStore();

      const setFocusDuration = renderHook(() => useSetFocusDuration()).result;

      act(() => {
        setFocusDuration.current(30);
      });

      const stored = localStorage.getItem("session-storage");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state).toHaveProperty("focusDuration");
      expect(parsed.state).toHaveProperty("currentSessionType");
    });

    it("should restore session state from localStorage on reload", async () => {
      localStorage.clear();
      vi.resetModules();

      const firstStore = await import(
        "@/features/countdown-timer/stores/session-store"
      );

      const setFocusDuration = renderHook(() =>
        firstStore.useSetFocusDuration(),
      ).result;

      act(() => {
        setFocusDuration.current(45);
      });

      const stored = localStorage.getItem("session-storage");
      expect(stored).not.toBeNull();

      vi.resetModules();
      const reloadedStore = await import(
        "@/features/countdown-timer/stores/session-store"
      );

      expect(
        renderHook(() => reloadedStore.useFocusDuration()).result.current,
      ).toBe(45);
    });
  });
});

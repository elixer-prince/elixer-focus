import { useSessionHistoryStore } from "@/features/countdown-timer/stores/session-history-store";

const resetTrackingStore = () => {
  useSessionHistoryStore.setState({
    sessions: [],
    lastCompletedSession: null,
    trackedIntervals: [],
    reflectionDraft: "",
  });
};

describe("session history tracking", () => {
  beforeEach(() => {
    localStorage.removeItem("session-history-storage");
    resetTrackingStore();
  });

  it("records a completed session and one linked overrun idempotently", () => {
    const store = useSessionHistoryStore.getState();
    store.startIdleInterval(1_000);

    store.completeSession("Focus", 1_500, 5_000, "run-1", true);
    store.completeSession("Focus", 1_500, 5_000, "run-1", true);

    const state = useSessionHistoryStore.getState();
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0]).toEqual({
      id: "run-1",
      sessionType: "Focus",
      durationInSeconds: 1_500,
      completedAt: 5_000,
    });
    expect(state.lastCompletedSession?.id).toBe("run-1");
    expect(state.trackedIntervals).toHaveLength(2);
    expect(state.trackedIntervals[0]).toMatchObject({
      kind: "idle",
      startedAt: 1_000,
      endedAt: 5_000,
      sessionId: null,
    });
    expect(state.trackedIntervals[1]).toMatchObject({
      kind: "overrun",
      startedAt: 5_000,
      endedAt: null,
      sessionId: "run-1",
    });
  });

  it("resolves an overrun into idle without closing the reflection twice", () => {
    const store = useSessionHistoryStore.getState();
    store.completeSession("Short Break", 300, 5_000, "run-2", true);

    store.resolvePendingSession("run-2", 8_000);
    store.resolvePendingSession("run-2", 9_000);

    const state = useSessionHistoryStore.getState();
    expect(state.lastCompletedSession).toBeNull();
    expect(state.trackedIntervals).toHaveLength(2);
    expect(state.trackedIntervals[0]).toMatchObject({
      kind: "overrun",
      startedAt: 5_000,
      endedAt: 8_000,
      sessionId: "run-2",
    });
    expect(state.trackedIntervals[1]).toMatchObject({
      kind: "idle",
      startedAt: 8_000,
      endedAt: null,
      sessionId: null,
    });
  });

  it("keeps post completion time idle when overrun attribution is disabled", () => {
    const store = useSessionHistoryStore.getState();
    store.completeSession("Long Break", 900, 5_000, "run-3", false);

    store.resolvePendingSession("run-3", 8_000);

    const state = useSessionHistoryStore.getState();
    expect(state.trackedIntervals).toHaveLength(1);
    expect(state.trackedIntervals[0]).toMatchObject({
      kind: "idle",
      startedAt: 5_000,
      endedAt: null,
      sessionId: null,
    });
  });

  it("removes a session overrun without removing idle history", () => {
    const store = useSessionHistoryStore.getState();
    store.startIdleInterval(1_000);
    store.completeSession("Focus", 1_500, 5_000, "run-4", true);

    useSessionHistoryStore.getState().removeSession("run-4");

    const state = useSessionHistoryStore.getState();
    expect(state.sessions).toHaveLength(0);
    expect(state.trackedIntervals).toHaveLength(2);
    expect(
      state.trackedIntervals.every((interval) => interval.kind === "idle"),
    ).toBe(true);
    expect(state.trackedIntervals[0]).toMatchObject({
      kind: "idle",
      startedAt: 1_000,
      endedAt: 5_000,
    });
    expect(state.trackedIntervals[1]).toMatchObject({
      kind: "idle",
      endedAt: null,
      sessionId: null,
    });
  });
});

import { waitFor } from "@testing-library/react";
import {
  dispatchTimerCommand,
  getTimerCoordinatorStatus,
  startTimerCoordinator,
} from "@/features/countdown-timer/services/timer-coordinator";
import { useCountdownTimerStore } from "@/features/countdown-timer/stores/countdown-store";
import { useSessionHistoryStore } from "@/features/countdown-timer/stores/session-history-store";
import { useSessionStore } from "@/features/countdown-timer/stores/session-store";
import { useJournalStore } from "@/features/journal/stores/journal-store";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/storage";

const channels: FakeBroadcastChannel[] = [];

class FakeBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  messages: unknown[] = [];
  closed = false;

  constructor(name: string) {
    this.name = name;
    channels.push(this);
  }

  postMessage(message: unknown) {
    this.messages.push(message);
  }

  close() {
    this.closed = true;
  }
}

const setInitialStoreState = () => {
  useCountdownTimerStore.setState({
    timerRunning: false,
    timerPaused: true,
    remainingTimeInSeconds: 1_500,
    startTimeInMinutes: 25,
    sessionProgressInSeconds: 0,
    timerRunId: null,
    activeRunDurationInSeconds: null,
  });
  useSessionStore.setState({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionCountLimit: 4,
    currentSessionType: "Focus",
    previousSessionType: null,
    currentSessionCount: 0,
    totalSessionsCompleted: 0,
    attributeSessionOverrun: true,
  });
  useSessionHistoryStore.setState({
    sessions: [],
    lastCompletedSession: null,
    trackedIntervals: [],
    reflectionDraft: "",
  });
  useJournalStore.setState({ entries: [], notes: [] });
};

describe("timer coordinator", () => {
  let stopCoordinator: (() => void) | undefined;

  beforeEach(() => {
    localStorage.clear();
    channels.length = 0;
    setInitialStoreState();
  });

  afterEach(() => {
    stopCoordinator?.();
    stopCoordinator = undefined;
    vi.unstubAllGlobals();
  });

  it("starts idle tracking and warns when coordination APIs are unavailable", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });

    stopCoordinator = startTimerCoordinator();

    expect(getTimerCoordinatorStatus()).toEqual({
      ready: true,
      supported: false,
      isCoordinator: true,
    });
    expect(useSessionHistoryStore.getState().trackedIntervals).toMatchObject([
      { kind: "idle", endedAt: null, userId: null },
    ]);
  });

  it("holds the Web Lock and applies timer commands in the owner tab", async () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, callback: () => Promise<void>) => callback(),
      },
    });

    stopCoordinator = startTimerCoordinator();

    await waitFor(() =>
      expect(getTimerCoordinatorStatus()).toEqual({
        ready: true,
        supported: true,
        isCoordinator: true,
      }),
    );
    expect(channels[0].messages).toContainEqual({ type: "request-state" });
    expect(channels[0].messages).toContainEqual(
      expect.objectContaining({ type: "state" }),
    );

    useCountdownTimerStore.setState({ remainingTimeInSeconds: 300 });
    dispatchTimerCommand({ type: "start" });

    await waitFor(() =>
      expect(useCountdownTimerStore.getState().timerRunning).toBe(true),
    );
    expect(useCountdownTimerStore.getState().timerRunId).toBeTruthy();
    expect(useCountdownTimerStore.getState().activeRunDurationInSeconds).toBe(
      1_500,
    );
    expect(getFromLocalStorage<number>("timerEndTime")).not.toBeNull();
    const runId = useCountdownTimerStore.getState().timerRunId;

    dispatchTimerCommand({ type: "pause" });
    await waitFor(() =>
      expect(useCountdownTimerStore.getState().timerPaused).toBe(true),
    );
    expect(useCountdownTimerStore.getState().timerRunId).toBe(runId);
    expect(
      useSessionHistoryStore
        .getState()
        .trackedIntervals.some(
          (interval) => interval.kind === "idle" && interval.endedAt === null,
        ),
    ).toBe(true);

    dispatchTimerCommand({ type: "start" });
    await waitFor(() =>
      expect(useCountdownTimerStore.getState().timerPaused).toBe(false),
    );
    expect(useCountdownTimerStore.getState().timerRunId).toBe(runId);
    expect(useCountdownTimerStore.getState().activeRunDurationInSeconds).toBe(
      1_500,
    );
  });

  it("assigns an ID and configured duration to a legacy active timer", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });
    const deadline = Date.now() + 60_000;
    saveToLocalStorage("timerEndTime", deadline);

    stopCoordinator = startTimerCoordinator();

    const timer = useCountdownTimerStore.getState();
    expect(timer.timerRunId).toBeTruthy();
    expect(timer.activeRunDurationInSeconds).toBe(1_500);
    expect(timer.timerRunning).toBe(true);
    expect(timer.timerPaused).toBe(false);
    expect(useSessionHistoryStore.getState().trackedIntervals).toHaveLength(0);
  });

  it("routes commands through BroadcastChannel while waiting for the lock", () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: () => new Promise<void>(() => undefined),
      },
    });

    stopCoordinator = startTimerCoordinator();
    dispatchTimerCommand({ type: "pause" });

    expect(channels[0].messages).toContainEqual({
      type: "command",
      command: { type: "pause" },
    });
  });

  it("applies a state broadcast to a follower tab", async () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: () => new Promise<void>(() => undefined),
      },
    });
    useSessionStore.setState({ sessionCountLimit: 6 });
    const persistedSessionState = localStorage.getItem("session-storage");
    useSessionStore.setState({ sessionCountLimit: 2 });
    localStorage.setItem("session-storage", persistedSessionState ?? "");
    stopCoordinator = startTimerCoordinator();
    const timerEndTime = Date.now() + 42_000;

    channels[0].onmessage?.({
      data: {
        type: "state",
        snapshot: {
          timerRunning: true,
          timerPaused: false,
          remainingTimeInSeconds: 42,
          sessionProgressInSeconds: 3,
          timerEndTime,
          timerPausedRemainingTime: null,
        },
      },
    } as MessageEvent);

    await waitFor(() =>
      expect(getTimerCoordinatorStatus()).toEqual({
        ready: true,
        supported: true,
        isCoordinator: false,
      }),
    );
    expect(useCountdownTimerStore.getState()).toMatchObject({
      timerRunning: true,
      timerPaused: false,
      remainingTimeInSeconds: 42,
      sessionProgressInSeconds: 3,
    });
    expect(useSessionStore.getState().sessionCountLimit).toBe(6);
    expect(getFromLocalStorage<number>("timerEndTime")).toBe(timerEndTime);
  });

  it("uses the last session count command processed by the coordinator", async () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, callback: () => Promise<void>) => callback(),
      },
    });
    stopCoordinator = startTimerCoordinator();
    await waitFor(() => expect(getTimerCoordinatorStatus().ready).toBe(true));

    channels[0].onmessage?.({
      data: {
        type: "command",
        command: { type: "set-session-count-limit", limit: 6 },
      },
    } as MessageEvent);
    channels[0].onmessage?.({
      data: {
        type: "command",
        command: { type: "set-session-count-limit", limit: 3 },
      },
    } as MessageEvent);

    await waitFor(() =>
      expect(useSessionStore.getState().sessionCountLimit).toBe(3),
    );
    expect(
      channels[0].messages.filter(
        (message) => (message as { type?: string }).type === "state",
      ),
    ).toHaveLength(3);
  });

  it("schedules a long break when a completed focus session reaches the limit", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });
    useSessionStore.setState({ sessionCountLimit: 1, currentSessionCount: 0 });
    saveToLocalStorage("timerEndTime", Date.now() - 3_000);
    useCountdownTimerStore.setState({
      timerRunId: "completed-focus",
      activeRunDurationInSeconds: 1_500,
    });

    stopCoordinator = startTimerCoordinator();

    expect(useSessionStore.getState()).toMatchObject({
      currentSessionType: "Long Break",
      currentSessionCount: 0,
    });
    expect(useSessionHistoryStore.getState().sessions).toContainEqual(
      expect.objectContaining({
        id: "completed-focus",
        sessionType: "Focus",
      }),
    );
  });

  it("recovers an expired legacy timer as one session with its saved deadline", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });
    const deadline = Date.now() - 3_000;
    saveToLocalStorage("timerEndTime", deadline);
    useCountdownTimerStore.setState({
      timerRunId: "legacy-run",
      activeRunDurationInSeconds: null,
    });

    stopCoordinator = startTimerCoordinator();

    const history = useSessionHistoryStore.getState();
    expect(history.sessions).toHaveLength(1);
    expect(history.sessions[0]).toMatchObject({
      id: "legacy-run",
      sessionType: "Focus",
      durationInSeconds: 1_500,
      completedAt: deadline,
    });
    expect(history.trackedIntervals).toContainEqual(
      expect.objectContaining({
        kind: "overrun",
        sessionId: "legacy-run",
        startedAt: deadline,
        endedAt: null,
      }),
    );
  });

  it("starts a missing pending reflection interval at its completion timestamp", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });
    const session = {
      id: "pending-run",
      sessionType: "Short Break" as const,
      durationInSeconds: 300,
      completedAt: Date.now() - 10_000,
    };
    useSessionHistoryStore.setState({
      sessions: [session],
      lastCompletedSession: session,
      trackedIntervals: [],
      reflectionDraft: "Keep this draft",
    });

    stopCoordinator = startTimerCoordinator();

    expect(useSessionHistoryStore.getState().trackedIntervals).toContainEqual(
      expect.objectContaining({
        kind: "overrun",
        sessionId: session.id,
        startedAt: session.completedAt,
        endedAt: null,
      }),
    );
  });

  it("applies and persists a session count limit without interrupting the timer", async () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, callback: () => Promise<void>) => callback(),
      },
    });
    saveToLocalStorage("timerEndTime", Date.now() + 60_000);
    useCountdownTimerStore.setState({
      timerRunning: true,
      timerPaused: false,
      remainingTimeInSeconds: 60,
      sessionProgressInSeconds: 120,
      timerRunId: "active-run",
      activeRunDurationInSeconds: 1_500,
    });
    useSessionStore.setState({ currentSessionCount: 2 });

    stopCoordinator = startTimerCoordinator();
    await waitFor(() => expect(getTimerCoordinatorStatus().ready).toBe(true));
    const timerBeforeSave = useCountdownTimerStore.getState();

    dispatchTimerCommand({ type: "set-session-count-limit", limit: 6 });

    await waitFor(() =>
      expect(useSessionStore.getState().sessionCountLimit).toBe(6),
    );
    expect(useSessionStore.getState().currentSessionCount).toBe(2);
    expect(useCountdownTimerStore.getState()).toMatchObject({
      timerRunning: timerBeforeSave.timerRunning,
      timerPaused: timerBeforeSave.timerPaused,
      remainingTimeInSeconds: timerBeforeSave.remainingTimeInSeconds,
      sessionProgressInSeconds: timerBeforeSave.sessionProgressInSeconds,
      timerRunId: timerBeforeSave.timerRunId,
    });
    expect(channels[0].messages).toContainEqual(
      expect.objectContaining({ type: "state" }),
    );
    expect(
      JSON.parse(localStorage.getItem("session-storage") ?? "{}").state
        .sessionCountLimit,
    ).toBe(6);
  });

  it("schedules long breaks at the configured count and leaves manual switches unchanged", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });
    useSessionStore.setState({ sessionCountLimit: 2, currentSessionCount: 0 });
    stopCoordinator = startTimerCoordinator();

    dispatchTimerCommand({
      type: "switch-session",
      sessionType: "Short Break",
    });
    expect(useSessionStore.getState().currentSessionCount).toBe(0);
    dispatchTimerCommand({ type: "switch-session", sessionType: "Focus" });
    expect(useSessionStore.getState().currentSessionCount).toBe(0);

    dispatchTimerCommand({ type: "skip" });
    expect(useSessionStore.getState()).toMatchObject({
      currentSessionType: "Short Break",
      currentSessionCount: 1,
    });
    dispatchTimerCommand({ type: "skip" });
    expect(useSessionStore.getState()).toMatchObject({
      currentSessionType: "Focus",
      currentSessionCount: 1,
    });
    dispatchTimerCommand({ type: "skip" });
    expect(useSessionStore.getState()).toMatchObject({
      currentSessionType: "Long Break",
      currentSessionCount: 0,
    });
    dispatchTimerCommand({ type: "skip" });
    expect(useSessionStore.getState()).toMatchObject({
      currentSessionType: "Focus",
      currentSessionCount: 0,
    });
  });

  it("defers a lowered limit until after the current short break and next focus session", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });
    useSessionStore.setState({
      currentSessionType: "Short Break",
      currentSessionCount: 3,
      sessionCountLimit: 4,
    });
    stopCoordinator = startTimerCoordinator();

    dispatchTimerCommand({ type: "set-session-count-limit", limit: 2 });
    expect(useSessionStore.getState()).toMatchObject({
      currentSessionType: "Short Break",
      currentSessionCount: 3,
      sessionCountLimit: 2,
    });

    dispatchTimerCommand({ type: "skip" });
    expect(useSessionStore.getState()).toMatchObject({
      currentSessionType: "Focus",
      currentSessionCount: 3,
    });
    dispatchTimerCommand({ type: "skip" });
    expect(useSessionStore.getState()).toMatchObject({
      currentSessionType: "Long Break",
      currentSessionCount: 0,
    });
  });
});

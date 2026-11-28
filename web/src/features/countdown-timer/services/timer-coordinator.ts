import { format } from "date-fns";
import { useCountdownTimerStore } from "@/features/countdown-timer/stores/countdown-store";
import { useSessionHistoryStore } from "@/features/countdown-timer/stores/session-history-store";
import { useSessionStore } from "@/features/countdown-timer/stores/session-store";
import type { CountdownSession } from "@/features/countdown-timer/types/session";
import { useJournalStore } from "@/features/journal/stores/journal-store";
import { convertMinutesToSeconds } from "@/utils/conversion";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/storage";
import { isValidSessionCountLimit } from "@elixer-focus/shared/timer";

const LOCK_NAME = "elixer-focus-timer-coordinator";
const CHANNEL_NAME = "elixer-focus-timer";

export type TimerCoordinatorCommand =
  | { type: "start" }
  | { type: "pause" }
  | { type: "reset" }
  | { type: "skip" }
  | { type: "switch-session"; sessionType: CountdownSession }
  | { type: "set-overrun-attribution"; enabled: boolean }
  | { type: "set-session-count-limit"; limit: number }
  | { type: "reflection-draft"; draft: string }
  | {
      type: "resolve-reflection";
      sessionId: string;
      draft: string;
      save: boolean;
    };

type TimerSnapshot = {
  timerRunning: boolean;
  timerPaused: boolean;
  remainingTimeInSeconds: number;
  sessionProgressInSeconds: number;
  timerEndTime: number | null;
  timerPausedRemainingTime: number | null;
};

type TimerCoordinatorMessage =
  | { type: "command"; command: TimerCoordinatorCommand }
  | { type: "request-state" }
  | { type: "state"; snapshot: TimerSnapshot };

export type TimerCoordinatorStatus = {
  ready: boolean;
  supported: boolean;
  isCoordinator: boolean;
};

const defaultStatus: TimerCoordinatorStatus = {
  ready: false,
  supported: true,
  isCoordinator: false,
};

let coordinatorStatus = defaultStatus;
let activeCoordinator: {
  channel: BroadcastChannel | null;
  disposed: boolean;
  isOwner: boolean;
  releaseLock: (() => void) | null;
  queuedCommands: TimerCoordinatorCommand[];
  commandQueue: Promise<void>;
} | null = null;
const listeners = new Set<() => void>();

const updateStatus = (status: TimerCoordinatorStatus) => {
  coordinatorStatus = status;
  listeners.forEach((listener) => listener());
};

export const getTimerCoordinatorStatus = () => coordinatorStatus;

export const subscribeToTimerCoordinator = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): TimerSnapshot => {
  const timer = useCountdownTimerStore.getState();
  return {
    timerRunning: timer.timerRunning,
    timerPaused: timer.timerPaused,
    remainingTimeInSeconds: timer.remainingTimeInSeconds,
    sessionProgressInSeconds: timer.sessionProgressInSeconds,
    timerEndTime: getFromLocalStorage<number>("timerEndTime"),
    timerPausedRemainingTime: getFromLocalStorage<number>(
      "timerPausedRemainingTime",
    ),
  };
};

export const broadcastTimerState = () => {
  if (!activeCoordinator?.isOwner || !activeCoordinator.channel) return;
  activeCoordinator.channel.postMessage({
    type: "state",
    snapshot: getSnapshot(),
  } satisfies TimerCoordinatorMessage);
};

const getDurationForSession = (sessionType: CountdownSession) => {
  const session = useSessionStore.getState();
  switch (sessionType) {
    case "Short Break":
      return session.shortBreakDuration;
    case "Long Break":
      return session.longBreakDuration;
    default:
      return session.focusDuration;
  }
};

const resetTimerForSession = (
  sessionType: CountdownSession,
  at: number,
  startIdle: boolean,
) => {
  const timer = useCountdownTimerStore.getState();
  const duration = getDurationForSession(sessionType);
  timer.setTimerRunning(false);
  timer.setTimerPaused(true);
  timer.setStartTimeInMinutes(duration);
  timer.setRemainingTimeInSeconds(convertMinutesToSeconds(duration));
  timer.resetSessionProgressInSeconds();
  timer.clearTimerRun();
  saveToLocalStorage("timerEndTime", null);
  saveToLocalStorage("timerPausedRemainingTime", null);

  if (startIdle) useSessionHistoryStore.getState().startIdleInterval(at);
};

const advanceSession = (at: number, startIdle: boolean) => {
  const session = useSessionStore.getState();
  let nextSession: CountdownSession;

  switch (session.currentSessionType) {
    case "Short Break":
    case "Long Break":
      nextSession = "Focus";
      if (session.currentSessionType === "Long Break")
        session.resetCurrentSessionCount();
      break;
    default:
      if (session.currentSessionCount + 1 >= session.sessionCountLimit) {
        nextSession = "Long Break";
        session.resetCurrentSessionCount();
      } else {
        nextSession = "Short Break";
        session.incrementCurrentSessionCount();
      }
  }

  session.setCurrentSessionType(nextSession);
  resetTimerForSession(nextSession, at, startIdle);
};

const saveReflection = (sessionId: string, draft: string) => {
  const session = useSessionHistoryStore
    .getState()
    .sessions.find((item) => item.id === sessionId);
  if (!session || !draft.trim()) return;

  const journal = useJournalStore.getState();
  const date = format(new Date(session.completedAt), "yyyy-MM-dd");
  const entry = journal.getEntryByDate(date) ?? journal.saveEntry(date, "");
  journal.createNote(
    entry.id,
    `Reflection: ${session.sessionType}`,
    draft.trim(),
    "reflection",
    session.id,
  );
};

const applyCommand = (command: TimerCoordinatorCommand) => {
  const now = Date.now();

  if (command.type === "set-overrun-attribution") {
    useSessionStore.getState().setAttributeSessionOverrun(command.enabled);
    return;
  }

  if (command.type === "set-session-count-limit") {
    if (isValidSessionCountLimit(command.limit)) {
      useSessionStore.getState().setSessionCountLimit(command.limit);
    }
    return;
  }

  if (command.type === "reflection-draft") {
    useSessionHistoryStore.getState().setReflectionDraft(command.draft);
    return;
  }

  if (command.type === "resolve-reflection") {
    const history = useSessionHistoryStore.getState();
    if (history.lastCompletedSession?.id !== command.sessionId) return;
    if (command.save) saveReflection(command.sessionId, command.draft);
    history.resolvePendingSession(command.sessionId, now);
    return;
  }

  const timer = useCountdownTimerStore.getState();
  const history = useSessionHistoryStore.getState();
  const session = useSessionStore.getState();
  if (history.lastCompletedSession) return;

  if (command.type === "start") {
    if (!timer.timerPaused || timer.remainingTimeInSeconds <= 0) return;
    history.closeIdleInterval(now);
    const runId = timer.timerRunId ?? crypto.randomUUID();
    const activeDuration =
      timer.activeRunDurationInSeconds ??
      (timer.timerRunId
        ? timer.remainingTimeInSeconds
        : convertMinutesToSeconds(timer.startTimeInMinutes));
    timer.setTimerRun(runId, activeDuration);
    timer.setTimerPaused(false);
    timer.setTimerRunning(true);
    const endTime = now + timer.remainingTimeInSeconds * 1_000;
    saveToLocalStorage("timerEndTime", endTime);
    saveToLocalStorage("timerPausedRemainingTime", null);
    return;
  }

  if (command.type === "pause") {
    if (timer.timerPaused || !timer.timerRunning) return;
    timer.setTimerPaused(true);
    saveToLocalStorage(
      "timerPausedRemainingTime",
      timer.remainingTimeInSeconds,
    );
    saveToLocalStorage("timerEndTime", null);
    history.startIdleInterval(now);
    return;
  }

  if (command.type === "reset") {
    resetTimerForSession(session.currentSessionType, now, true);
    return;
  }

  if (command.type === "skip") {
    advanceSession(now, true);
    return;
  }

  if (command.type === "switch-session") {
    if (command.sessionType === session.currentSessionType) return;
    session.setCurrentSessionType(command.sessionType);
    resetTimerForSession(command.sessionType, now, true);
  }
};

const enqueueCommand = (command: TimerCoordinatorCommand) => {
  const coordinator = activeCoordinator;
  if (!coordinator) return;
  coordinator.commandQueue = coordinator.commandQueue
    .then(() => applyCommand(command))
    .then(() => broadcastTimerState());
};

const recoverCoordinatorState = () => {
  const timer = useCountdownTimerStore.getState();
  const history = useSessionHistoryStore.getState();
  const session = useSessionStore.getState();
  const now = Date.now();
  const endTime = getFromLocalStorage<number>("timerEndTime");

  if (endTime !== null) {
    const runId = timer.timerRunId ?? crypto.randomUUID();
    const duration =
      timer.activeRunDurationInSeconds ??
      convertMinutesToSeconds(timer.startTimeInMinutes);
    if (!timer.timerRunId || timer.activeRunDurationInSeconds === null) {
      timer.setTimerRun(runId, duration);
    }

    if (endTime <= now) {
      const completedSession = history.sessions.find(
        (item) => item.id === runId,
      );
      if (!completedSession) {
        history.completeSession(
          session.currentSessionType,
          duration,
          endTime,
          runId,
          session.attributeSessionOverrun,
        );
        session.setPreviousSessionType(session.currentSessionType);
        advanceSession(now, false);
      } else if (
        history.lastCompletedSession?.id === runId &&
        session.currentSessionType === completedSession.sessionType
      ) {
        session.setPreviousSessionType(completedSession.sessionType);
        advanceSession(now, false);
      } else {
        resetTimerForSession(session.currentSessionType, now, false);
      }
    } else {
      timer.setTimerRunning(true);
      timer.setTimerPaused(false);
      timer.setRemainingTimeInSeconds(
        Math.max(0, Math.round((endTime - now) / 1_000)),
      );
    }
  } else {
    const pausedRemaining = getFromLocalStorage<number>(
      "timerPausedRemainingTime",
    );
    if (pausedRemaining !== null)
      timer.setRemainingTimeInSeconds(pausedRemaining);
  }

  const timerIsActive = endTime !== null && endTime > now;
  history.initializeTracking(
    timerIsActive
      ? endTime! - (timer.activeRunDurationInSeconds ?? 0) * 1_000
      : now,
    timerIsActive,
    session.attributeSessionOverrun,
  );
};

const applyRemoteSnapshot = async (snapshot: TimerSnapshot) => {
  await Promise.all([
    useCountdownTimerStore.persist.rehydrate(),
    useSessionHistoryStore.persist.rehydrate(),
    useSessionStore.persist.rehydrate(),
    useJournalStore.persist.rehydrate(),
  ]);
  useCountdownTimerStore.setState({
    timerRunning: snapshot.timerRunning,
    timerPaused: snapshot.timerPaused,
    remainingTimeInSeconds: snapshot.remainingTimeInSeconds,
    sessionProgressInSeconds: snapshot.sessionProgressInSeconds,
  });
  saveToLocalStorage("timerEndTime", snapshot.timerEndTime);
  saveToLocalStorage(
    "timerPausedRemainingTime",
    snapshot.timerPausedRemainingTime,
  );
  updateStatus({ ready: true, supported: true, isCoordinator: false });
};

const initializeCoordinator = () => {
  const coordinator = activeCoordinator;
  if (!coordinator) return;
  coordinator.isOwner = true;
  recoverCoordinatorState();
  if (coordinator.disposed) return;
  updateStatus({ ready: true, supported: true, isCoordinator: true });
  broadcastTimerState();
  coordinator.queuedCommands.forEach(enqueueCommand);
  coordinator.queuedCommands = [];
};

export const startTimerCoordinator = () => {
  if (activeCoordinator) return () => undefined;

  const supported =
    typeof window !== "undefined" &&
    typeof BroadcastChannel !== "undefined" &&
    "locks" in navigator;
  const coordinator = {
    channel: supported ? new BroadcastChannel(CHANNEL_NAME) : null,
    disposed: false,
    isOwner: false,
    releaseLock: null as (() => void) | null,
    queuedCommands: [] as TimerCoordinatorCommand[],
    commandQueue: Promise.resolve(),
  };
  activeCoordinator = coordinator;

  if (!supported) {
    recoverCoordinatorState();
    updateStatus({ ready: true, supported: false, isCoordinator: true });
    return () => stopTimerCoordinator(coordinator);
  }

  updateStatus({ ready: false, supported: true, isCoordinator: false });
  coordinator.channel!.onmessage = (
    event: MessageEvent<TimerCoordinatorMessage>,
  ) => {
    const message = event.data;
    if (message.type === "command") {
      if (coordinator.isOwner) {
        if (coordinatorStatus.ready) enqueueCommand(message.command);
        else coordinator.queuedCommands.push(message.command);
      }
      return;
    }

    if (message.type === "request-state") {
      if (coordinator.isOwner && coordinatorStatus.ready) broadcastTimerState();
      return;
    }

    if (!coordinator.isOwner) void applyRemoteSnapshot(message.snapshot);
  };
  coordinator.channel!.postMessage({
    type: "request-state",
  } satisfies TimerCoordinatorMessage);

  void navigator.locks
    .request(LOCK_NAME, async () => {
      if (coordinator.disposed) return;
      coordinator.isOwner = true;
      await Promise.all([
        useCountdownTimerStore.persist.rehydrate(),
        useSessionHistoryStore.persist.rehydrate(),
        useSessionStore.persist.rehydrate(),
        useJournalStore.persist.rehydrate(),
      ]);
      initializeCoordinator();
      await new Promise<void>((resolve) => {
        coordinator.releaseLock = resolve;
      });
      coordinator.isOwner = false;
      if (!coordinator.disposed)
        updateStatus({ ready: false, supported: true, isCoordinator: false });
    })
    .catch(() => {
      if (coordinator.disposed) return;
      coordinator.channel?.close();
      coordinator.channel = null;
      coordinator.isOwner = true;
      recoverCoordinatorState();
      updateStatus({ ready: true, supported: false, isCoordinator: true });
    });

  return () => stopTimerCoordinator(coordinator);
};

const stopTimerCoordinator = (
  coordinator: NonNullable<typeof activeCoordinator>,
) => {
  if (coordinator.disposed) return;
  coordinator.disposed = true;
  coordinator.releaseLock?.();
  coordinator.channel?.close();
  if (activeCoordinator === coordinator) activeCoordinator = null;
  updateStatus({ ready: false, supported: true, isCoordinator: false });
};

export const dispatchTimerCommand = (command: TimerCoordinatorCommand) => {
  const coordinator = activeCoordinator;
  if (coordinator?.channel && coordinatorStatus.supported) {
    if (coordinator.isOwner && coordinatorStatus.ready) {
      enqueueCommand(command);
    } else {
      coordinator.channel.postMessage({
        type: "command",
        command,
      } satisfies TimerCoordinatorMessage);
    }
    return;
  }

  applyCommand(command);
};

export const isTimerCoordinatorOwner = () =>
  !activeCoordinator ||
  !coordinatorStatus.supported ||
  coordinatorStatus.isCoordinator;

export const broadcastReflectionDraft = (draft: string) =>
  dispatchTimerCommand({ type: "reflection-draft", draft });

export const requestReflectionResolution = (
  sessionId: string,
  draft: string,
  save: boolean,
) =>
  dispatchTimerCommand({
    type: "resolve-reflection",
    sessionId,
    draft,
    save,
  });

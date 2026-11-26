import {
  dispatchCalendarCommand,
  readPendingSleepEventMigration,
} from "@/features/calendar/services/calendar-coordinator";
import {
  initialSleepScheduleData,
  type ActualSleepRecord,
  type SleepScheduleData,
  type SleepScheduleSettings,
} from "@/features/sleep-schedule/types/sleep-schedule";
import { migrateLegacySleepEvents } from "@/features/sleep-schedule/services/sleep-schedule-migration";
import {
  formatLocalDate,
  isValidLocalDate,
} from "@/features/calendar/utils/calendar-date";
import {
  getMostRecentIncompleteSleepRecord,
  isValidActualSleepRecord,
  isValidSleepScheduleSettings,
} from "@/features/sleep-schedule/utils/sleep-schedule";
import toast from "react-hot-toast";

const LOCK_NAME = "elixer-focus-sleep-schedule-coordinator";
const CHANNEL_NAME = "elixer-focus-sleep-schedule";
const STORAGE_KEY = "sleep-schedule-storage";
const STORAGE_VERSION = 1;

export type SleepScheduleCommand =
  | { type: "save-settings"; settings: SleepScheduleSettings }
  | { type: "clear-schedule" }
  | { type: "record-bed"; sleepDate: string; actualAt?: number }
  | { type: "record-wake"; recordId?: string; actualAt?: number }
  | { type: "update-bed"; recordId: string; actualAt: number }
  | { type: "update-wake"; recordId: string; actualAt: number }
  | { type: "clear-wake"; recordId: string }
  | {
      type: "delete-night";
      recordId: string;
      confirmWakeRemoval?: boolean;
    }
  | { type: "remove-recovery"; recoveryId: string }
  | { type: "clear-recovery" }
  | { type: "import-legacy-events"; events: unknown[] };

export type SleepScheduleCommandResult = {
  success: boolean;
  error?: string;
};

export type SleepScheduleStateHandler = {
  apply: (data: SleepScheduleData) => void;
  get: () => SleepScheduleData;
  rehydrate: () => Promise<void>;
};

type QueuedCommand = {
  id: string;
  command: SleepScheduleCommand;
  resolve: (result: SleepScheduleCommandResult) => void;
};

type CoordinatorMessage =
  | { type: "command"; id: string; command: SleepScheduleCommand }
  | { type: "result"; id: string; result: SleepScheduleCommandResult }
  | { type: "state"; data: SleepScheduleData }
  | { type: "request-state" };

type SleepScheduleCoordinator = {
  channel: BroadcastChannel | null;
  disposed: boolean;
  isOwner: boolean;
  ready: boolean;
  hasRemoteState: boolean;
  supported: boolean;
  releaseLock: (() => void) | null;
  commandQueue: Promise<void>;
  queuedCommands: QueuedCommand[];
  pendingCommands: Map<string, QueuedCommand>;
};

let stateHandler: SleepScheduleStateHandler | undefined;
let activeCoordinator: SleepScheduleCoordinator | null = null;

export const registerSleepScheduleStateHandler = (
  handler: SleepScheduleStateHandler,
) => {
  stateHandler = handler;
};

const normalizeData = (value: unknown): SleepScheduleData => {
  const saved =
    value && typeof value === "object"
      ? (value as Partial<SleepScheduleData>)
      : null;
  const settings =
    saved && "settings" in saved
      ? saved.settings
      : initialSleepScheduleData.settings;

  return {
    settings: settings as SleepScheduleSettings,
    actualRecords: Array.isArray(saved?.actualRecords)
      ? (saved.actualRecords as ActualSleepRecord[])
      : [],
    recoveryEntries: Array.isArray(saved?.recoveryEntries)
      ? saved.recoveryEntries
      : [],
  };
};

const cloneData = (data: SleepScheduleData): SleepScheduleData => ({
  settings:
    data.settings && typeof data.settings === "object"
      ? { ...data.settings }
      : data.settings,
  actualRecords: data.actualRecords.map((record) => ({ ...record })),
  recoveryEntries: data.recoveryEntries.map((entry) => ({ ...entry })),
});

const getRecord = (records: ActualSleepRecord[], recordId: string) => {
  const record = records.find((item) => item.id === recordId);
  if (!record || !isValidActualSleepRecord(record)) {
    throw new Error("This actual sleep record is no longer available.");
  }
  return record;
};

const validateActualTimestamp = (actualAt: number, now: number) => {
  if (!Number.isFinite(actualAt)) {
    throw new Error("Enter a valid actual sleep time.");
  }
  if (actualAt > now) {
    throw new Error("Actual sleep times cannot be in the future.");
  }
};

export const applySleepScheduleCommand = (
  current: SleepScheduleData,
  command: SleepScheduleCommand,
  now = Date.now(),
): SleepScheduleData => {
  const next = cloneData(current);

  switch (command.type) {
    case "save-settings":
      if (!isValidSleepScheduleSettings(command.settings)) {
        throw new Error("Review the wake time and sleep duration.");
      }
      next.settings = { ...command.settings };
      break;
    case "clear-schedule":
      if (!next.settings || typeof next.settings !== "object") {
        throw new Error("Repair the sleep schedule settings first.");
      }
      next.settings = {
        ...next.settings,
        wakeTime: null,
        bedTimeOverride: null,
      };
      break;
    case "record-bed": {
      if (!isValidLocalDate(command.sleepDate)) {
        throw new Error("Choose a valid bedtime date.");
      }
      const actualAt = command.actualAt ?? now;
      validateActualTimestamp(actualAt, now);
      const today = formatLocalDate(new Date(now));
      if (command.sleepDate > today) {
        throw new Error(
          "Actual sleep times cannot be recorded for a future date.",
        );
      }
      if (formatLocalDate(new Date(actualAt)) !== command.sleepDate) {
        throw new Error("The bedtime must fall on the selected local date.");
      }

      const existing = next.actualRecords.find(
        (record) =>
          isValidActualSleepRecord(record) &&
          record.sleepDate === command.sleepDate,
      );
      if (existing) {
        if (existing.wakeAt !== null && existing.wakeAt <= actualAt) {
          throw new Error(
            "Bedtime must be earlier than the recorded wake time.",
          );
        }
        existing.bedAt = actualAt;
      } else {
        next.actualRecords.push({
          id: crypto.randomUUID(),
          sleepDate: command.sleepDate,
          bedAt: actualAt,
          wakeAt: null,
        });
      }
      break;
    }
    case "record-wake": {
      const actualAt = command.actualAt ?? now;
      validateActualTimestamp(actualAt, now);
      const record = getMostRecentIncompleteSleepRecord(
        next.actualRecords,
        actualAt,
      );
      if (!record) {
        throw new Error("Record a bedtime before recording a wake time.");
      }
      if (command.recordId && command.recordId !== record.id) {
        throw new Error("The most recent unfinished night changed. Try again.");
      }
      record.wakeAt = actualAt;
      break;
    }
    case "update-bed": {
      validateActualTimestamp(command.actualAt, now);
      const record = getRecord(next.actualRecords, command.recordId);
      if (record.wakeAt !== null && record.wakeAt <= command.actualAt) {
        throw new Error("Bedtime must be earlier than the recorded wake time.");
      }
      record.bedAt = command.actualAt;
      break;
    }
    case "update-wake": {
      validateActualTimestamp(command.actualAt, now);
      const record = getRecord(next.actualRecords, command.recordId);
      if (record.wakeAt === null) {
        throw new Error("Record a wake time before correcting it.");
      }
      if (command.actualAt <= record.bedAt) {
        throw new Error("Wake time must be later than bedtime.");
      }
      record.wakeAt = command.actualAt;
      break;
    }
    case "clear-wake": {
      const record = getRecord(next.actualRecords, command.recordId);
      record.wakeAt = null;
      break;
    }
    case "delete-night": {
      const record = getRecord(next.actualRecords, command.recordId);
      if (record.wakeAt !== null && !command.confirmWakeRemoval) {
        throw new Error("Confirm removing the recorded wake time first.");
      }
      next.actualRecords = next.actualRecords.filter(
        (item) => item.id !== command.recordId,
      );
      break;
    }
    case "remove-recovery":
      next.recoveryEntries = next.recoveryEntries.filter(
        (entry) => entry.id !== command.recoveryId,
      );
      break;
    case "clear-recovery":
      next.recoveryEntries = [];
      break;
    case "import-legacy-events":
      return migrateLegacySleepEvents(next, command.events, now);
  }

  return next;
};

const getPersistError = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Unable to save sleep schedule changes.";

const readStoredData = (): SleepScheduleData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored)
    return normalizeData(stateHandler?.get() ?? initialSleepScheduleData);

  const parsed = JSON.parse(stored) as { state?: unknown };
  return normalizeData(
    parsed.state ?? stateHandler?.get() ?? initialSleepScheduleData,
  );
};

const persistData = (data: SleepScheduleData) => {
  const previous = localStorage.getItem(STORAGE_KEY);
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: data, version: STORAGE_VERSION }),
    );
  } catch (error) {
    try {
      if (previous === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, previous);
    } catch {
      // Keep the original write error as the useful failure reason.
    }
    throw error;
  }
};

const applyDataToStore = (data: SleepScheduleData) => {
  stateHandler?.apply(data);
};

const executeCommand = async (
  command: SleepScheduleCommand,
): Promise<SleepScheduleCommandResult> => {
  try {
    const next = applySleepScheduleCommand(readStoredData(), command);
    persistData(next);
    applyDataToStore(next);
    activeCoordinator?.channel?.postMessage({ type: "state", data: next });
    return { success: true };
  } catch (error) {
    const message = getPersistError(error);
    toast.error(message);
    return { success: false, error: message };
  }
};

const enqueueCommand = (
  coordinator: SleepScheduleCoordinator,
  id: string,
  command: SleepScheduleCommand,
): Promise<SleepScheduleCommandResult> => {
  const resultPromise = coordinator.commandQueue.then(() =>
    executeCommand(command),
  );
  coordinator.commandQueue = resultPromise.then(() => undefined);
  return resultPromise.then((result) => {
    coordinator.channel?.postMessage({ type: "result", id, result });
    return result;
  });
};

const flushQueuedCommands = (coordinator: SleepScheduleCoordinator) => {
  const queued = coordinator.queuedCommands.splice(0);
  queued.forEach(({ id, command, resolve }) => {
    if (coordinator.isOwner) {
      void enqueueCommand(coordinator, id, command).then(resolve);
    } else {
      coordinator.pendingCommands.set(id, { id, command, resolve });
      coordinator.channel?.postMessage({ type: "command", id, command });
    }
  });
};

const importLegacyCalendarEvents = async () => {
  const events = readPendingSleepEventMigration();
  if (!events.length) return;

  const result = await executeCommand({
    type: "import-legacy-events",
    events,
  });
  if (!result.success) return;

  await dispatchCalendarCommand({ type: "clear-sleep-migration" });
};

const rehydrateAndImportLegacy = async () => {
  try {
    await stateHandler?.rehydrate();
    await importLegacyCalendarEvents();
  } catch (error) {
    toast.error(getPersistError(error));
  }
};

export const dispatchSleepScheduleCommand = (
  command: SleepScheduleCommand,
): Promise<SleepScheduleCommandResult> => {
  const coordinator = activeCoordinator;
  const id = crypto.randomUUID();

  if (!coordinator || !coordinator.supported) return executeCommand(command);

  return new Promise((resolve) => {
    const queuedCommand = { id, command, resolve };
    if (coordinator.isOwner && coordinator.ready) {
      void enqueueCommand(coordinator, id, command).then(resolve);
    } else if (coordinator.hasRemoteState) {
      coordinator.pendingCommands.set(id, queuedCommand);
      coordinator.channel?.postMessage({ type: "command", id, command });
    } else {
      coordinator.queuedCommands.push(queuedCommand);
      coordinator.channel?.postMessage({ type: "request-state" });
    }
  });
};

export const startSleepScheduleCoordinator = () => {
  const supported =
    typeof BroadcastChannel !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.locks !== "undefined";
  const coordinator: SleepScheduleCoordinator = {
    channel: supported ? new BroadcastChannel(CHANNEL_NAME) : null,
    disposed: false,
    isOwner: false,
    ready: false,
    hasRemoteState: false,
    supported,
    releaseLock: null,
    commandQueue: Promise.resolve(),
    queuedCommands: [],
    pendingCommands: new Map(),
  };
  activeCoordinator = coordinator;

  if (!supported) {
    coordinator.isOwner = true;
    coordinator.ready = true;
    void rehydrateAndImportLegacy();
    return () => stopSleepScheduleCoordinator(coordinator);
  }

  coordinator.channel!.onmessage = (
    event: MessageEvent<CoordinatorMessage>,
  ) => {
    const message = event.data;
    if (message.type === "command") {
      if (coordinator.isOwner) {
        if (coordinator.ready) {
          void enqueueCommand(coordinator, message.id, message.command);
        } else {
          coordinator.queuedCommands.push({
            id: message.id,
            command: message.command,
            resolve: () => undefined,
          });
        }
      }
      return;
    }

    if (message.type === "request-state") {
      if (coordinator.isOwner && coordinator.ready) {
        coordinator.channel?.postMessage({
          type: "state",
          data: readStoredData(),
        } satisfies CoordinatorMessage);
      }
      return;
    }

    if (message.type === "state") {
      if (!coordinator.isOwner) {
        coordinator.hasRemoteState = true;
        applyDataToStore(message.data);
        flushQueuedCommands(coordinator);
      }
      return;
    }

    const pending = coordinator.pendingCommands.get(message.id);
    if (pending) {
      coordinator.pendingCommands.delete(message.id);
      pending.resolve(message.result);
    }
  };

  coordinator.channel!.postMessage({ type: "request-state" });

  void navigator.locks
    .request(LOCK_NAME, async () => {
      if (coordinator.disposed) return;
      coordinator.isOwner = true;
      await rehydrateAndImportLegacy();
      if (coordinator.disposed) return;
      coordinator.ready = true;
      const data = readStoredData();
      applyDataToStore(data);
      coordinator.channel?.postMessage({
        type: "state",
        data,
      } satisfies CoordinatorMessage);
      flushQueuedCommands(coordinator);
      await new Promise<void>((resolve) => {
        coordinator.releaseLock = resolve;
      });
      coordinator.isOwner = false;
      coordinator.ready = false;
    })
    .catch(() => {
      if (coordinator.disposed) return;
      coordinator.channel?.close();
      coordinator.channel = null;
      coordinator.supported = false;
      coordinator.isOwner = true;
      coordinator.ready = true;
      void rehydrateAndImportLegacy().then(() => {
        coordinator.pendingCommands.forEach(({ command, resolve }) => {
          void executeCommand(command).then(resolve);
        });
        coordinator.pendingCommands.clear();
        flushQueuedCommands(coordinator);
      });
    });

  return () => stopSleepScheduleCoordinator(coordinator);
};

const stopSleepScheduleCoordinator = (
  coordinator: SleepScheduleCoordinator,
) => {
  if (coordinator.disposed) return;
  coordinator.disposed = true;
  coordinator.releaseLock?.();
  coordinator.channel?.close();
  coordinator.queuedCommands.forEach(({ resolve }) =>
    resolve({ success: false, error: "Sleep Schedule coordination stopped." }),
  );
  coordinator.pendingCommands.forEach(({ resolve }) =>
    resolve({ success: false, error: "Sleep Schedule coordination stopped." }),
  );
  if (activeCoordinator === coordinator) activeCoordinator = null;
};

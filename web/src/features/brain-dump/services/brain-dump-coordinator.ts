import {
  type BrainDumpCommand,
  type BrainDumpCommandResult,
  type BrainDumpThought,
} from "@/features/brain-dump/types/brain-dump";
import {
  setBrainDumpState,
  useBrainDumpStore,
} from "@/features/brain-dump/stores/brain-dump-store";

const STORAGE_KEY = "brain-dump-storage";
const STORAGE_VERSION = 1;
const LOCK_NAME = "elixer-focus-brain-dump-coordinator";
const CHANNEL_NAME = "elixer-focus-brain-dump";
const READ_ERROR = "Your saved thoughts could not be read.";

type BrainDumpCoordinatorMessage =
  | { type: "command"; command: BrainDumpCommand }
  | { type: "state" }
  | { type: "single-tab-only" };

type BrainDumpCoordinator = {
  channel: BroadcastChannel | null;
  supported: boolean;
  disposed: boolean;
  commandQueue: Promise<void>;
};

type AppliedCommand = {
  thoughts: BrainDumpThought[];
  result: BrainDumpCommandResult;
  changed: boolean;
};

let activeCoordinator: BrainDumpCoordinator | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateThought = (value: unknown): BrainDumpThought => {
  if (!isRecord(value)) throw new Error(READ_ERROR);

  const { id, content, createdAt, updatedAt, lastMutationId, userId } = value;
  if (
    typeof id !== "string" ||
    id.length === 0 ||
    typeof content !== "string" ||
    content.trim().length === 0 ||
    typeof createdAt !== "number" ||
    !Number.isFinite(createdAt) ||
    !Number.isFinite(new Date(createdAt).getTime()) ||
    typeof updatedAt !== "number" ||
    !Number.isFinite(updatedAt) ||
    !Number.isFinite(new Date(updatedAt).getTime()) ||
    typeof lastMutationId !== "string" ||
    lastMutationId.length === 0 ||
    (userId !== null && typeof userId !== "string")
  ) {
    throw new Error(READ_ERROR);
  }

  return {
    id,
    content,
    createdAt,
    updatedAt,
    lastMutationId,
    userId,
  };
};

const sortThoughts = (thoughts: BrainDumpThought[]) =>
  [...thoughts].sort((a, b) => b.createdAt - a.createdAt);

export const readStoredBrainDumpThoughts = (): BrainDumpThought[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(READ_ERROR);
  }

  if (
    !isRecord(parsed) ||
    typeof parsed.version !== "number" ||
    parsed.version > STORAGE_VERSION ||
    !isRecord(parsed.state) ||
    !Array.isArray(parsed.state.thoughts)
  ) {
    throw new Error(READ_ERROR);
  }

  const thoughts = parsed.state.thoughts.map(validateThought);
  if (new Set(thoughts.map((thought) => thought.id)).size !== thoughts.length) {
    throw new Error(READ_ERROR);
  }

  return sortThoughts(thoughts);
};

const writeStoredBrainDumpThoughts = (thoughts: BrainDumpThought[]) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: { thoughts },
      version: STORAGE_VERSION,
    }),
  );
};

const failedResult = (error: unknown): BrainDumpCommandResult => ({
  success: false,
  error: error instanceof Error ? error.message : "Unable to save thoughts.",
});

export const applyBrainDumpCommand = (
  currentThoughts: BrainDumpThought[],
  command: BrainDumpCommand,
): AppliedCommand => {
  if (command.type === "add") {
    const content = command.content.trim();
    if (!content) {
      return {
        thoughts: currentThoughts,
        result: { success: false, error: "Thought cannot be empty." },
        changed: false,
      };
    }

    const existing = currentThoughts.find(
      (thought) => thought.id === command.thoughtId,
    );
    if (existing) {
      return {
        thoughts: currentThoughts,
        result: {
          success: true,
          outcome: "already-applied",
          thought: existing,
        },
        changed: false,
      };
    }

    const thought: BrainDumpThought = {
      id: command.thoughtId,
      content,
      createdAt: command.createdAt,
      updatedAt: command.createdAt,
      lastMutationId: command.commandId,
      userId: null,
    };
    return {
      thoughts: sortThoughts([thought, ...currentThoughts]),
      result: { success: true, outcome: "added", thought },
      changed: true,
    };
  }

  if (command.type === "update") {
    const content = command.content.trim();
    if (!content) {
      return {
        thoughts: currentThoughts,
        result: { success: false, error: "Thought cannot be empty." },
        changed: false,
      };
    }

    const existing = currentThoughts.find(
      (thought) => thought.id === command.thoughtId,
    );
    if (!existing) {
      return {
        thoughts: currentThoughts,
        result: { success: true, outcome: "deleted-elsewhere" },
        changed: false,
      };
    }

    if (existing.lastMutationId === command.commandId) {
      return {
        thoughts: currentThoughts,
        result: {
          success: true,
          outcome: "already-applied",
          thought: existing,
        },
        changed: false,
      };
    }

    const winsConflict =
      command.updatedAt > existing.updatedAt ||
      (command.updatedAt === existing.updatedAt &&
        command.commandId > existing.lastMutationId);
    if (!winsConflict) {
      return {
        thoughts: currentThoughts,
        result: {
          success: true,
          outcome: "superseded",
          thought: existing,
        },
        changed: false,
      };
    }

    const thought = {
      ...existing,
      content,
      updatedAt: command.updatedAt,
      lastMutationId: command.commandId,
    };
    return {
      thoughts: sortThoughts(
        currentThoughts.map((item) =>
          item.id === command.thoughtId ? thought : item,
        ),
      ),
      result: { success: true, outcome: "updated", thought },
      changed: true,
    };
  }

  const existing = currentThoughts.find(
    (thought) => thought.id === command.thoughtId,
  );
  if (!existing) {
    return {
      thoughts: currentThoughts,
      result: { success: true, outcome: "already-applied" },
      changed: false,
    };
  }

  return {
    thoughts: currentThoughts.filter(
      (thought) => thought.id !== command.thoughtId,
    ),
    result: { success: true, outcome: "deleted" },
    changed: true,
  };
};

const readAndApplyStoredThoughts = (allowRetry: boolean) => {
  if (!allowRetry && useBrainDumpStore.getState().readStatus === "error") {
    return { success: false, error: READ_ERROR } as const;
  }

  try {
    const thoughts = readStoredBrainDumpThoughts();
    setBrainDumpState({ thoughts, readStatus: "ready", readError: null });
    return { success: true } as const;
  } catch {
    setBrainDumpState({
      readStatus: "error",
      readError: READ_ERROR,
    });
    return { success: false, error: READ_ERROR } as const;
  }
};

export const readBrainDumpThoughts = () => readAndApplyStoredThoughts(true);

export const retryReadBrainDumpThoughts = async () => {
  const coordinator = activeCoordinator;
  if (!coordinator?.supported) return readAndApplyStoredThoughts(true);

  try {
    return await navigator.locks.request(LOCK_NAME, () =>
      readAndApplyStoredThoughts(true),
    );
  } catch {
    markSingleTabOnly(coordinator);
    return readAndApplyStoredThoughts(true);
  }
};

const executeCommandWithoutLock = (
  command: BrainDumpCommand,
): BrainDumpCommandResult => {
  const store = useBrainDumpStore.getState();
  if (store.readStatus !== "ready")
    return { success: false, error: READ_ERROR };

  let currentThoughts: BrainDumpThought[];
  try {
    currentThoughts = readStoredBrainDumpThoughts();
  } catch {
    setBrainDumpState({ readStatus: "error", readError: READ_ERROR });
    return { success: false, error: READ_ERROR };
  }

  const applied = applyBrainDumpCommand(currentThoughts, command);
  if (!applied.result.success) return applied.result;

  if (applied.changed) {
    try {
      writeStoredBrainDumpThoughts(applied.thoughts);
    } catch (error) {
      return failedResult(error);
    }
  }

  setBrainDumpState({
    thoughts: applied.thoughts,
    readStatus: "ready",
    readError: null,
  });
  activeCoordinator?.channel?.postMessage({ type: "state" });
  return applied.result;
};

const markSingleTabOnly = (
  coordinator: BrainDumpCoordinator,
  notifyOtherTabs = true,
) => {
  if (!coordinator.supported) return;
  coordinator.supported = false;
  if (notifyOtherTabs)
    coordinator.channel?.postMessage({ type: "single-tab-only" });
  coordinator.channel?.close();
  coordinator.channel = null;
  setBrainDumpState({ crossTabSupported: false });
};

const executeCommand = async (
  command: BrainDumpCommand,
  coordinator: BrainDumpCoordinator | null,
): Promise<BrainDumpCommandResult> => {
  if (!coordinator?.supported) return executeCommandWithoutLock(command);

  try {
    return await navigator.locks.request(LOCK_NAME, () =>
      executeCommandWithoutLock(command),
    );
  } catch {
    markSingleTabOnly(coordinator);
    return executeCommandWithoutLock(command);
  }
};

const enqueueCommand = (
  coordinator: BrainDumpCoordinator,
  command: BrainDumpCommand,
) => {
  const resultPromise = coordinator.commandQueue.then(() =>
    executeCommand(command, coordinator),
  );
  coordinator.commandQueue = resultPromise.then(
    () => undefined,
    () => undefined,
  );
  return resultPromise;
};

export const dispatchBrainDumpCommand = (command: BrainDumpCommand) => {
  const coordinator = activeCoordinator;
  if (coordinator?.supported) {
    coordinator.channel?.postMessage({
      type: "command",
      command,
    } satisfies BrainDumpCoordinatorMessage);
  }
  return coordinator
    ? enqueueCommand(coordinator, command)
    : executeCommand(command, null);
};

export const startBrainDumpCoordinator = () => {
  if (activeCoordinator) return () => undefined;

  let supported =
    typeof window !== "undefined" &&
    typeof BroadcastChannel !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.locks?.request === "function";
  let channel: BroadcastChannel | null = null;
  if (supported) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      supported = false;
    }
  }

  const coordinator: BrainDumpCoordinator = {
    channel,
    supported,
    disposed: false,
    commandQueue: Promise.resolve(),
  };
  activeCoordinator = coordinator;
  setBrainDumpState({ crossTabSupported: supported });

  if (channel) {
    channel.onmessage = (event: MessageEvent<BrainDumpCoordinatorMessage>) => {
      const message = event.data;
      if (message.type === "command") {
        void enqueueCommand(coordinator, message.command);
      } else if (message.type === "state") {
        void readAndApplyStoredThoughts(false);
      } else {
        markSingleTabOnly(coordinator, false);
      }
    };
  }

  readBrainDumpThoughts();

  return () => {
    if (coordinator.disposed) return;
    coordinator.disposed = true;
    coordinator.channel?.close();
    if (activeCoordinator === coordinator) activeCoordinator = null;
  };
};

import {
  initialCalendarData,
  isWeekStartsOn,
  type CalendarData,
  type ScheduledOccurrence,
  type WeekStartsOn,
} from "@/features/calendar/types/calendar";
import { isValidLocalDate } from "@/features/calendar/utils/calendar-date";
import type { Task, TaskCategory } from "@/features/tasks/types/task";
import toast from "react-hot-toast";

const LOCK_NAME = "elixer-focus-calendar-coordinator";
const CHANNEL_NAME = "elixer-focus-calendar";
const TASKS_STORAGE_KEY = "tasks-storage";
const CALENDAR_STORAGE_KEY = "calendar-storage";
const TASKS_STORAGE_VERSION = 4;
const CALENDAR_STORAGE_VERSION = 1;

type TaskStateHandler = {
  apply: (tasks: Task[]) => void;
  get: () => Task[];
  rehydrate: () => Promise<void>;
};

export type CalendarStateHandler = {
  apply: (data: CalendarData) => void;
  get: () => CalendarData;
  rehydrate: () => Promise<void>;
};

export type CalendarCoordinatorCommand =
  | {
      type: "add-task";
      title: string;
      description?: string;
      category?: TaskCategory;
    }
  | {
      type: "update-task";
      taskId: string;
      updates: Partial<
        Pick<Task, "title" | "description" | "defaultDurationMinutes">
      >;
    }
  | { type: "remove-task"; taskId: string }
  | { type: "toggle-task-completion"; taskId: string; completed: boolean }
  | { type: "set-tasks"; tasks: Task[] }
  | { type: "reorder-tasks"; tasks: Task[] }
  | {
      type: "schedule-task";
      taskId: string;
      date: string;
      startTime?: string;
      durationMinutes?: number;
    }
  | {
      type: "create-task-and-schedule";
      title: string;
      description?: string;
      date: string;
      startTime?: string;
      durationMinutes?: number;
    }
  | { type: "remove-occurrence"; occurrenceId: string }
  | { type: "set-week-start"; weekStartsOn: WeekStartsOn };

export type CalendarCoordinatorResult = {
  success: boolean;
  error?: string;
};

export type CalendarSnapshot = {
  tasks: Task[];
  calendar: CalendarData;
};

type CoordinatorMessage =
  | { type: "command"; id: string; command: CalendarCoordinatorCommand }
  | { type: "request-state" }
  | { type: "state"; snapshot: CalendarSnapshot }
  | { type: "result"; id: string; result: CalendarCoordinatorResult };

type QueuedCommand = {
  id: string;
  command: CalendarCoordinatorCommand;
  resolve: (result: CalendarCoordinatorResult) => void;
};

let taskStateHandler: TaskStateHandler | null = null;
let calendarStateHandler: CalendarStateHandler | null = null;

export const registerTaskStateHandler = (handler: TaskStateHandler) => {
  taskStateHandler = handler;
};

export const registerCalendarStateHandler = (handler: CalendarStateHandler) => {
  calendarStateHandler = handler;
};

let activeCoordinator: {
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
} | null = null;

const normalizeTasks = (tasks: Task[]): Task[] =>
  tasks.map((task) => ({
    ...task,
    updatedAt: task.updatedAt ?? task.createdAt,
    defaultDurationMinutes: task.defaultDurationMinutes ?? 30,
  }));

const normalizeCalendarData = (data: Partial<CalendarData> | null) => {
  const weekStartsOn = data?.weekStartsOn;

  return {
    recurrenceSeries: data?.recurrenceSeries ?? [],
    recurrenceRuleSegments: data?.recurrenceRuleSegments ?? [],
    scheduledOccurrences: data?.scheduledOccurrences ?? [],
    sleepEventRecords: data?.sleepEventRecords ?? [],
    weekStartsOn: isWeekStartsOn(weekStartsOn)
      ? weekStartsOn
      : initialCalendarData.weekStartsOn,
  };
};

const readStoredValue = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  const parsed = JSON.parse(raw) as { state?: T };
  return parsed.state ?? fallback;
};

const readLatestSnapshot = (): CalendarSnapshot => {
  if (!taskStateHandler || !calendarStateHandler) {
    throw new Error("Calendar storage is not ready yet.");
  }

  const taskState = readStoredValue<{ tasks?: Task[] }>(TASKS_STORAGE_KEY, {
    tasks: taskStateHandler.get(),
  });

  return {
    tasks: normalizeTasks(taskState.tasks ?? taskStateHandler.get()),
    calendar: normalizeCalendarData(
      readStoredValue(CALENDAR_STORAGE_KEY, calendarStateHandler.get()),
    ),
  };
};

const isValidTime = (time: string) => {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [hours, minutes] = time.split(":").map(Number);
  return hours <= 23 && minutes <= 59;
};

const createOccurrence = (
  task: Task,
  date: string,
  startTime?: string,
  durationMinutes?: number,
): ScheduledOccurrence => {
  if (!isValidLocalDate(date)) throw new Error("Choose a valid date.");
  if (startTime !== undefined && !isValidTime(startTime)) {
    throw new Error("Choose a valid start time.");
  }
  if (startTime === undefined && durationMinutes !== undefined) {
    throw new Error("An untimed task cannot have a duration.");
  }

  const duration = startTime
    ? (durationMinutes ?? task.defaultDurationMinutes ?? 30)
    : undefined;
  if (
    duration !== undefined &&
    (!Number.isInteger(duration) || duration < 1 || duration > 1440)
  ) {
    throw new Error("Duration must be between 1 and 1440 minutes.");
  }

  return {
    id: crypto.randomUUID(),
    taskId: task.id,
    date,
    ...(startTime && { startTime, durationMinutes: duration }),
    title: task.title,
    description: task.description,
    category: task.category,
    isCompleted: false,
    isSkipped: false,
  };
};

export const applyCalendarCoordinatorCommand = (
  snapshot: CalendarSnapshot,
  command: CalendarCoordinatorCommand,
  now = Date.now(),
): CalendarSnapshot => {
  const next = {
    tasks: snapshot.tasks.map((task) => ({ ...task })),
    calendar: {
      ...snapshot.calendar,
      scheduledOccurrences: [...snapshot.calendar.scheduledOccurrences],
    },
  };

  switch (command.type) {
    case "add-task": {
      const title = command.title.trim();
      if (!title) throw new Error("Enter a task title.");
      next.tasks.unshift({
        id: crypto.randomUUID(),
        title,
        description: command.description?.trim() || undefined,
        category: command.category ?? "uncategorised",
        isCompleted: false,
        isSelected: false,
        createdAt: now,
        updatedAt: now,
        defaultDurationMinutes: 30,
      });
      break;
    }
    case "update-task": {
      const task = next.tasks.find((item) => item.id === command.taskId);
      if (!task) throw new Error("This task is no longer available.");
      Object.assign(task, command.updates, { updatedAt: now });
      break;
    }
    case "remove-task":
      next.tasks = next.tasks.filter((task) => task.id !== command.taskId);
      break;
    case "toggle-task-completion": {
      const task = next.tasks.find((item) => item.id === command.taskId);
      if (!task) throw new Error("This task is no longer available.");
      const wasCompleted = task.isCompleted;
      task.isCompleted = command.completed;
      task.updatedAt = now;
      if (command.completed && !wasCompleted) task.completedAt = now;
      else if (!command.completed) delete task.completedAt;
      break;
    }
    case "set-tasks":
      next.tasks = normalizeTasks(command.tasks);
      break;
    case "reorder-tasks": {
      const currentTasks = new Map(next.tasks.map((task) => [task.id, task]));
      const orderedIds = new Set<string>();
      const orderedTasks = command.tasks.flatMap((task) => {
        const currentTask = currentTasks.get(task.id);
        if (!currentTask) return [];
        orderedIds.add(task.id);
        return [{ ...currentTask, category: task.category }];
      });
      next.tasks = [
        ...orderedTasks,
        ...next.tasks.filter((task) => !orderedIds.has(task.id)),
      ];
      break;
    }
    case "schedule-task": {
      const task = next.tasks.find((item) => item.id === command.taskId);
      if (!task) throw new Error("Choose an available task.");
      next.calendar.scheduledOccurrences.push(
        createOccurrence(
          task,
          command.date,
          command.startTime,
          command.durationMinutes,
        ),
      );
      break;
    }
    case "create-task-and-schedule": {
      const title = command.title.trim();
      if (!title) throw new Error("Enter a task title.");
      const task: Task = {
        id: crypto.randomUUID(),
        title,
        description: command.description?.trim() || undefined,
        category: "uncategorised",
        isCompleted: false,
        isSelected: false,
        createdAt: now,
        updatedAt: now,
        defaultDurationMinutes: 30,
      };
      next.tasks.unshift(task);
      next.calendar.scheduledOccurrences.push(
        createOccurrence(
          task,
          command.date,
          command.startTime,
          command.durationMinutes,
        ),
      );
      break;
    }
    case "remove-occurrence":
      next.calendar.scheduledOccurrences =
        next.calendar.scheduledOccurrences.filter(
          (occurrence) => occurrence.id !== command.occurrenceId,
        );
      break;
    case "set-week-start":
      if (!isWeekStartsOn(command.weekStartsOn)) {
        throw new Error("Choose a valid first day of the week.");
      }
      next.calendar.weekStartsOn = command.weekStartsOn;
      break;
  }

  return next;
};

const persistSnapshot = (snapshot: CalendarSnapshot) => {
  const previousTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  const previousCalendar = localStorage.getItem(CALENDAR_STORAGE_KEY);

  try {
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify({
        state: { tasks: snapshot.tasks },
        version: TASKS_STORAGE_VERSION,
      }),
    );
    localStorage.setItem(
      CALENDAR_STORAGE_KEY,
      JSON.stringify({
        state: snapshot.calendar,
        version: CALENDAR_STORAGE_VERSION,
      }),
    );
  } catch (error) {
    try {
      if (previousTasks === null) localStorage.removeItem(TASKS_STORAGE_KEY);
      else localStorage.setItem(TASKS_STORAGE_KEY, previousTasks);
      if (previousCalendar === null)
        localStorage.removeItem(CALENDAR_STORAGE_KEY);
      else localStorage.setItem(CALENDAR_STORAGE_KEY, previousCalendar);
    } catch {
      // Keep the original write error as the useful failure reason.
    }
    throw error;
  }
};

const applySnapshotToStores = (snapshot: CalendarSnapshot) => {
  taskStateHandler?.apply(snapshot.tasks);
  calendarStateHandler?.apply(snapshot.calendar);
};

const getPersistError = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to save calendar changes.";

const executeCommand = async (
  command: CalendarCoordinatorCommand,
): Promise<CalendarCoordinatorResult> => {
  try {
    const snapshot = applyCalendarCoordinatorCommand(
      readLatestSnapshot(),
      command,
    );
    persistSnapshot(snapshot);
    applySnapshotToStores(snapshot);
    activeCoordinator?.channel?.postMessage({
      type: "state",
      snapshot,
    } satisfies CoordinatorMessage);
    return { success: true };
  } catch (error) {
    return { success: false, error: getPersistError(error) };
  }
};

const enqueueCommand = (
  coordinator: NonNullable<typeof activeCoordinator>,
  id: string,
  command: CalendarCoordinatorCommand,
): Promise<CalendarCoordinatorResult> => {
  const resultPromise = coordinator.commandQueue.then(() =>
    executeCommand(command),
  );
  coordinator.commandQueue = resultPromise.then(() => undefined);
  return resultPromise.then((result) => {
    coordinator.channel?.postMessage({ type: "result", id, result });
    return result;
  });
};

const flushQueuedCommands = (
  coordinator: NonNullable<typeof activeCoordinator>,
) => {
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

export const dispatchCalendarCommand = (
  command: CalendarCoordinatorCommand,
): Promise<CalendarCoordinatorResult> => {
  const coordinator = activeCoordinator;
  const id = crypto.randomUUID();

  const resultPromise = new Promise<CalendarCoordinatorResult>((resolve) => {
    if (!coordinator || !coordinator.supported) {
      void executeCommand(command).then(resolve);
      return;
    }

    const queuedCommand = { id, command, resolve };
    if (coordinator.isOwner && coordinator.ready) {
      void enqueueCommand(coordinator, id, command).then(resolve);
    } else if (coordinator.hasRemoteState) {
      coordinator.pendingCommands.set(id, queuedCommand);
      coordinator.channel?.postMessage({ type: "command", id, command });
    } else {
      coordinator.queuedCommands.push(queuedCommand);
    }
  });

  return resultPromise.then((result) => {
    if (!result.success) {
      toast.error(`Calendar changes were not saved: ${result.error}`);
    }
    return result;
  });
};

export const startCalendarCoordinator = () => {
  if (activeCoordinator) return () => undefined;

  const supported =
    typeof window !== "undefined" &&
    typeof BroadcastChannel !== "undefined" &&
    "locks" in navigator;
  const coordinator = {
    channel: supported ? new BroadcastChannel(CHANNEL_NAME) : null,
    disposed: false,
    isOwner: false,
    ready: false,
    hasRemoteState: false,
    supported,
    releaseLock: null as (() => void) | null,
    commandQueue: Promise.resolve(),
    queuedCommands: [] as QueuedCommand[],
    pendingCommands: new Map<string, QueuedCommand>(),
  };
  activeCoordinator = coordinator;

  if (!supported) {
    coordinator.isOwner = true;
    coordinator.ready = true;
    return () => stopCalendarCoordinator(coordinator);
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
          snapshot: readLatestSnapshot(),
        } satisfies CoordinatorMessage);
      }
      return;
    }

    if (message.type === "state") {
      if (!coordinator.isOwner) {
        coordinator.hasRemoteState = true;
        applySnapshotToStores(message.snapshot);
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
      await Promise.all([
        taskStateHandler?.rehydrate(),
        calendarStateHandler?.rehydrate(),
      ]);
      coordinator.ready = true;
      const snapshot = readLatestSnapshot();
      applySnapshotToStores(snapshot);
      coordinator.channel?.postMessage({
        type: "state",
        snapshot,
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
      coordinator.pendingCommands.forEach(({ command, resolve }) => {
        void executeCommand(command).then(resolve);
      });
      coordinator.pendingCommands.clear();
      flushQueuedCommands(coordinator);
    });

  return () => stopCalendarCoordinator(coordinator);
};

const stopCalendarCoordinator = (
  coordinator: NonNullable<typeof activeCoordinator>,
) => {
  if (coordinator.disposed) return;
  coordinator.disposed = true;
  coordinator.releaseLock?.();
  coordinator.channel?.close();
  coordinator.queuedCommands.forEach(({ resolve }) =>
    resolve({ success: false, error: "Calendar coordination stopped." }),
  );
  coordinator.pendingCommands.forEach(({ resolve }) =>
    resolve({ success: false, error: "Calendar coordination stopped." }),
  );
  if (activeCoordinator === coordinator) activeCoordinator = null;
};

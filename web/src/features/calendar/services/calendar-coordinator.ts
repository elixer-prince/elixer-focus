import {
  type RecurrenceRuleDraft,
  type RecurrenceRuleSegment,
  type RecurrenceSeries,
  initialCalendarData,
  isWeekStartsOn,
  type CalendarData,
  type ScheduledOccurrence,
  type WeekStartsOn,
} from "@/features/calendar/types/calendar";
import {
  formatLocalDate,
  isValidLocalDate,
  parseLocalDate,
} from "@/features/calendar/utils/calendar-date";
import {
  getRecurrenceDatesInRange,
  validateRecurrenceRule,
} from "@/features/calendar/utils/calendar-recurrence";
import type {
  Task,
  TaskCategory,
  TaskUpdate,
} from "@/features/tasks/types/task";
import type { Subtask } from "@/features/tasks/types/subtask";
import {
  assertValidSubtasks,
  getSubtasksForParent,
  removeSubtaskTree,
  reorderSubtasks,
} from "@/features/tasks/utils/subtask-tree";
import { getCurrentTimestamp } from "@/utils/date";
import { subDays } from "date-fns";
import toast from "react-hot-toast";

const LOCK_NAME = "elixer-focus-calendar-coordinator";
const CHANNEL_NAME = "elixer-focus-calendar";
const TASKS_STORAGE_KEY = "tasks-storage";
const SUBTASKS_STORAGE_KEY = "subtasks-storage";
const CALENDAR_STORAGE_KEY = "calendar-storage";
const TASKS_STORAGE_VERSION = 5;
const SUBTASKS_STORAGE_VERSION = 1;
const CALENDAR_STORAGE_VERSION = 2;
const LEGACY_SUBTASK_OWNER_ERROR =
  "Subtasks are unavailable while an older tab owns the coordinator. Refresh that tab to continue.";

type TaskStateHandler = {
  apply: (tasks: Task[]) => void;
  get: () => Task[];
  rehydrate: () => Promise<void>;
};

export type SubtaskStateHandler = {
  apply: (subtasks: Subtask[]) => void;
  get: () => Subtask[];
  rehydrate: () => Promise<void>;
  setCoordinatorSupportsSubtasks: (supported: boolean | null) => void;
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
      updates: TaskUpdate;
    }
  | { type: "remove-task"; taskId: string }
  | { type: "toggle-task-completion"; taskId: string; completed: boolean }
  | { type: "set-tasks"; tasks: Task[] }
  | { type: "reorder-tasks"; tasks: Task[] }
  | {
      type: "add-subtask";
      taskId: string;
      parentSubtaskId: string | null;
      title: string;
    }
  | { type: "update-subtask"; subtaskId: string; title: string }
  | {
      type: "toggle-subtask-completion";
      subtaskId: string;
      completed: boolean;
    }
  | { type: "remove-subtask"; subtaskId: string }
  | {
      type: "reorder-subtasks";
      subtaskId: string;
      targetSubtaskId: string | null;
      before: boolean;
    }
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
  | {
      type: "create-recurrence";
      taskId: string;
      startDate: string;
      rule: RecurrenceRuleDraft;
    }
  | {
      type: "create-task-and-recurrence";
      title: string;
      description?: string;
      startDate: string;
      rule: RecurrenceRuleDraft;
    }
  | { type: "materialize-range"; startDate: string; endDate: string }
  | {
      type: "edit-occurrence";
      occurrenceId: string;
      startTime?: string;
      durationMinutes?: number;
    }
  | {
      type: "edit-recurrence";
      seriesId: string;
      date: string;
      scope: "future" | "series";
      rule: RecurrenceRuleDraft;
    }
  | {
      type: "delete-scheduled-occurrence";
      occurrenceId: string;
      scope: "occurrence" | "future" | "series";
    }
  | {
      type: "set-occurrence-completion";
      occurrenceId: string;
      completed: boolean;
    }
  | { type: "remove-occurrence"; occurrenceId: string }
  | { type: "set-week-start"; weekStartsOn: WeekStartsOn }
  | { type: "clear-sleep-migration" };

export type CalendarCoordinatorResult = {
  success: boolean;
  error?: string;
};

export type CalendarSnapshot = {
  tasks: Task[];
  subtasks: Subtask[];
  calendar: CalendarData;
  supportsSubtasks?: boolean;
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
let subtaskStateHandler: SubtaskStateHandler | null = null;
let calendarStateHandler: CalendarStateHandler | null = null;

export const registerTaskStateHandler = (handler: TaskStateHandler) => {
  taskStateHandler = handler;
};

export const registerSubtaskStateHandler = (handler: SubtaskStateHandler) => {
  subtaskStateHandler = handler;
};

export const registerCalendarStateHandler = (handler: CalendarStateHandler) => {
  calendarStateHandler = handler;
};

type ActiveCoordinator = {
  channel: BroadcastChannel | null;
  disposed: boolean;
  isOwner: boolean;
  ready: boolean;
  hasRemoteState: boolean;
  coordinatorSupportsSubtasks: boolean | null;
  supported: boolean;
  releaseLock: (() => void) | null;
  commandQueue: Promise<void>;
  queuedCommands: QueuedCommand[];
  pendingCommands: Map<string, QueuedCommand>;
};

let activeCoordinator: ActiveCoordinator | null = null;

const normalizeTasks = (tasks: Task[]): Task[] =>
  tasks.map((task) => ({
    ...task,
    updatedAt: task.updatedAt ?? task.createdAt,
    defaultDurationMinutes: task.defaultDurationMinutes ?? 30,
  }));

const normalizeCalendarData = (data: Partial<CalendarData> | null) => {
  const saved = data as
    | (Partial<CalendarData> & { sleepEventRecords?: unknown[] })
    | null;
  const weekStartsOn = data?.weekStartsOn;
  const pendingSleepEvents =
    saved &&
    Object.prototype.hasOwnProperty.call(saved, "pendingSleepEventMigration")
      ? saved.pendingSleepEventMigration
      : saved?.sleepEventRecords;

  return {
    recurrenceSeries: data?.recurrenceSeries ?? [],
    recurrenceRuleSegments: data?.recurrenceRuleSegments ?? [],
    scheduledOccurrences: data?.scheduledOccurrences ?? [],
    pendingSleepEventMigration:
      pendingSleepEvents === undefined
        ? []
        : Array.isArray(pendingSleepEvents)
          ? pendingSleepEvents
          : [pendingSleepEvents],
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

export const readPendingSleepEventMigration = (): unknown[] => {
  const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
  if (!stored) return [];

  const parsed = JSON.parse(stored) as {
    state?: {
      pendingSleepEventMigration?: unknown;
      sleepEventRecords?: unknown;
    };
  };
  const state = parsed.state ?? {};
  const pending = Object.prototype.hasOwnProperty.call(
    state,
    "pendingSleepEventMigration",
  )
    ? state.pendingSleepEventMigration
    : state.sleepEventRecords;

  if (pending === undefined) return [];
  return Array.isArray(pending) ? pending : [pending];
};

const readLatestSnapshot = (): CalendarSnapshot => {
  if (!taskStateHandler || !calendarStateHandler) {
    throw new Error("Calendar storage is not ready yet.");
  }

  const taskState = readStoredValue<{ tasks?: Task[] }>(TASKS_STORAGE_KEY, {
    tasks: taskStateHandler.get(),
  });
  const tasks = normalizeTasks(taskState.tasks ?? taskStateHandler.get());
  const taskIds = new Set(tasks.map((task) => task.id));
  const subtaskState = readStoredValue<{ subtasks?: Subtask[] }>(
    SUBTASKS_STORAGE_KEY,
    { subtasks: subtaskStateHandler?.get() ?? [] },
  );
  const subtasks = (subtaskState.subtasks ?? []).filter((subtask) =>
    taskIds.has(subtask.taskId),
  );
  assertValidSubtasks(tasks, subtasks);

  return {
    tasks,
    subtasks,
    calendar: normalizeCalendarData(
      readStoredValue(CALENDAR_STORAGE_KEY, calendarStateHandler.get()),
    ),
    supportsSubtasks: true,
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

const createRuleSegment = (
  seriesId: string,
  effectiveFrom: string,
  rule: RecurrenceRuleDraft,
  id: string = crypto.randomUUID(),
): RecurrenceRuleSegment => {
  validateRecurrenceRule(rule, effectiveFrom);
  if (rule.endDate && rule.endDate < effectiveFrom) {
    throw new Error("The recurrence end date must be on or after its start.");
  }
  return {
    ...rule,
    ...(rule.weekdays && { weekdays: [...new Set(rule.weekdays)] }),
    id,
    seriesId,
    effectiveFrom,
  };
};

const createRecurrence = (
  next: CalendarSnapshot,
  task: Task,
  startDate: string,
  rule: RecurrenceRuleDraft,
) => {
  if (task.archivedAt !== undefined) {
    throw new Error("Choose an available task.");
  }
  if (!isValidLocalDate(startDate)) {
    throw new Error("Choose a valid recurrence start date.");
  }
  const series: RecurrenceSeries = {
    id: crypto.randomUUID(),
    taskId: task.id,
    startDate,
    isActive: true,
  };
  const segment = createRuleSegment(series.id, startDate, rule);
  next.calendar.recurrenceSeries.push(series);
  next.calendar.recurrenceRuleSegments.push(segment);
};

const materializeRecurrenceRange = (
  next: CalendarSnapshot,
  startDate: string,
  endDate: string,
) => {
  if (!isValidLocalDate(startDate) || !isValidLocalDate(endDate)) {
    throw new Error("Choose a valid calendar date range.");
  }
  if (startDate > endDate) return;

  const savedOccurrences = new Set(
    next.calendar.scheduledOccurrences
      .filter((occurrence) => occurrence.seriesId && occurrence.segmentId)
      .map(
        (occurrence) =>
          `${occurrence.seriesId}:${occurrence.segmentId}:${occurrence.date}`,
      ),
  );

  next.calendar.recurrenceSeries.forEach((series) => {
    if (!series.isActive) return;
    const task = next.tasks.find((item) => item.id === series.taskId);
    if (!task || task.archivedAt !== undefined) {
      series.isActive = false;
      return;
    }

    next.calendar.recurrenceRuleSegments
      .filter((segment) => segment.seriesId === series.id)
      .forEach((segment) => {
        getRecurrenceDatesInRange(series, segment, startDate, endDate).forEach(
          (date) => {
            const key = `${series.id}:${segment.id}:${date}`;
            if (savedOccurrences.has(key)) return;
            next.calendar.scheduledOccurrences.push({
              ...createOccurrence(
                task,
                date,
                segment.startTime,
                segment.durationMinutes,
              ),
              seriesId: series.id,
              segmentId: segment.id,
            });
            savedOccurrences.add(key);
          },
        );
      });
  });
};

const regenerateSavedOccurrences = (
  next: CalendarSnapshot,
  series: RecurrenceSeries,
  scopeStart: string | undefined,
) => {
  const task = next.tasks.find((item) => item.id === series.taskId);
  if (!task) throw new Error("This task is no longer available.");

  const allSeriesOccurrences = next.calendar.scheduledOccurrences.filter(
    (occurrence) => occurrence.seriesId === series.id,
  );
  const affectedOccurrences = allSeriesOccurrences.filter(
    (occurrence) => !scopeStart || occurrence.date >= scopeStart,
  );
  if (!affectedOccurrences.length) return;

  const rangeStart = scopeStart
    ? affectedOccurrences.reduce(
        (earliest, occurrence) =>
          occurrence.date < earliest ? occurrence.date : earliest,
        scopeStart,
      )
    : affectedOccurrences.reduce(
        (earliest, occurrence) =>
          occurrence.date < earliest ? occurrence.date : earliest,
        affectedOccurrences[0].date,
      );
  const rangeEnd = affectedOccurrences.reduce(
    (latest, occurrence) =>
      occurrence.date > latest ? occurrence.date : latest,
    affectedOccurrences[0].date,
  );
  const previousByDate = new Map(
    affectedOccurrences.map((occurrence) => [occurrence.date, occurrence]),
  );
  const regenerated = next.calendar.recurrenceRuleSegments
    .filter((segment) => segment.seriesId === series.id)
    .flatMap((segment) =>
      getRecurrenceDatesInRange(series, segment, rangeStart, rangeEnd).map(
        (date) => {
          const previous = previousByDate.get(date);
          const generated = createOccurrence(
            task,
            date,
            segment.startTime,
            segment.durationMinutes,
          );
          return {
            ...generated,
            ...(previous && {
              id: previous.id,
              title: previous.title,
              description: previous.description,
              category: previous.category,
              isCompleted: previous.isCompleted,
              ...(previous.completedAt !== undefined && {
                completedAt: previous.completedAt,
              }),
            }),
            seriesId: series.id,
            segmentId: segment.id,
          };
        },
      ),
    );

  next.calendar.scheduledOccurrences = [
    ...allSeriesOccurrences.filter((occurrence) =>
      scopeStart ? occurrence.date < scopeStart : false,
    ),
    ...next.calendar.scheduledOccurrences.filter(
      (occurrence) => occurrence.seriesId !== series.id,
    ),
    ...regenerated,
  ];
};

const deleteScheduledOccurrence = (
  next: CalendarSnapshot,
  occurrenceId: string,
  scope: "occurrence" | "future" | "series",
) => {
  const occurrence = next.calendar.scheduledOccurrences.find(
    (item) => item.id === occurrenceId,
  );
  if (!occurrence)
    throw new Error("This scheduled task is no longer available.");

  if (scope === "occurrence") {
    if (!occurrence.seriesId) {
      next.calendar.scheduledOccurrences =
        next.calendar.scheduledOccurrences.filter(
          (item) => item.id !== occurrenceId,
        );
      return;
    }
    occurrence.isSkipped = true;
    occurrence.isCompleted = false;
    delete occurrence.completedAt;
    return;
  }

  if (!occurrence.seriesId) {
    throw new Error("Choose a recurring occurrence for this action.");
  }
  const series = next.calendar.recurrenceSeries.find(
    (item) => item.id === occurrence.seriesId,
  );
  if (!series) throw new Error("This recurrence is no longer available.");

  if (scope === "series") {
    next.calendar.recurrenceSeries = next.calendar.recurrenceSeries.filter(
      (item) => item.id !== series.id,
    );
    next.calendar.recurrenceRuleSegments =
      next.calendar.recurrenceRuleSegments.filter(
        (segment) => segment.seriesId !== series.id,
      );
    next.calendar.scheduledOccurrences =
      next.calendar.scheduledOccurrences.filter(
        (item) => item.seriesId !== series.id,
      );
    return;
  }

  const previousDate = formatLocalDate(
    subDays(parseLocalDate(occurrence.date), 1),
  );
  next.calendar.recurrenceRuleSegments =
    next.calendar.recurrenceRuleSegments.flatMap((segment) => {
      if (segment.seriesId !== series.id) return [segment];
      if (segment.effectiveFrom >= occurrence.date) return [];
      if (
        segment.effectiveThrough !== undefined &&
        segment.effectiveThrough < occurrence.date
      ) {
        return [segment];
      }
      return [{ ...segment, effectiveThrough: previousDate }];
    });
  series.isActive = next.calendar.recurrenceRuleSegments.some(
    (segment) => segment.seriesId === series.id,
  );
  next.calendar.scheduledOccurrences =
    next.calendar.scheduledOccurrences.filter(
      (item) => item.seriesId !== series.id || item.date < occurrence.date,
    );
};

const editRecurrence = (
  next: CalendarSnapshot,
  seriesId: string,
  date: string,
  scope: "future" | "series",
  rule: RecurrenceRuleDraft,
) => {
  if (!isValidLocalDate(date)) throw new Error("Choose a valid edit date.");
  const series = next.calendar.recurrenceSeries.find(
    (item) => item.id === seriesId,
  );
  if (!series || !series.isActive) {
    throw new Error("This recurrence is no longer available.");
  }
  const task = next.tasks.find((item) => item.id === series.taskId);
  if (!task || task.archivedAt !== undefined) {
    throw new Error("This task is no longer available.");
  }
  const selectedOccurrence = next.calendar.scheduledOccurrences.find(
    (item) =>
      item.seriesId === series.id && item.date === date && !item.isSkipped,
  );
  if (!selectedOccurrence) {
    throw new Error("Choose an existing occurrence to edit.");
  }

  if (scope === "series") {
    const updatedSegments = next.calendar.recurrenceRuleSegments.map(
      (segment) => {
        if (segment.seriesId !== series.id) return segment;
        const updated = createRuleSegment(
          series.id,
          segment.effectiveFrom,
          rule,
          segment.id,
        );
        return {
          ...updated,
          ...(segment.effectiveThrough && {
            effectiveThrough: segment.effectiveThrough,
          }),
        };
      },
    );
    next.calendar.recurrenceRuleSegments = updatedSegments;
    regenerateSavedOccurrences(next, series, undefined);
    return;
  }

  const previousDate = formatLocalDate(subDays(parseLocalDate(date), 1));
  const updatedSegments = next.calendar.recurrenceRuleSegments.flatMap(
    (segment) => {
      if (segment.seriesId !== series.id) return [segment];
      if (segment.effectiveFrom >= date) return [];
      if (
        segment.effectiveThrough !== undefined &&
        segment.effectiveThrough < date
      ) {
        return [segment];
      }
      return [{ ...segment, effectiveThrough: previousDate }];
    },
  );
  updatedSegments.push(createRuleSegment(series.id, date, rule));
  next.calendar.recurrenceRuleSegments = updatedSegments;
  regenerateSavedOccurrences(next, series, date);
};

export const applyCalendarCoordinatorCommand = (
  snapshot: CalendarSnapshot,
  command: CalendarCoordinatorCommand,
  now = getCurrentTimestamp(),
): CalendarSnapshot => {
  const next = {
    tasks: snapshot.tasks.map((task) => ({ ...task })),
    subtasks: (snapshot.subtasks ?? []).map((subtask) => ({ ...subtask })),
    calendar: {
      ...snapshot.calendar,
      recurrenceSeries: snapshot.calendar.recurrenceSeries.map((series) => ({
        ...series,
      })),
      recurrenceRuleSegments: snapshot.calendar.recurrenceRuleSegments.map(
        (segment) => ({ ...segment }),
      ),
      scheduledOccurrences: snapshot.calendar.scheduledOccurrences.map(
        (occurrence) => ({ ...occurrence }),
      ),
      pendingSleepEventMigration: [
        ...snapshot.calendar.pendingSleepEventMigration,
      ],
    },
    supportsSubtasks: true,
  };
  assertValidSubtasks(next.tasks, next.subtasks);

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
      const { dueAt, ...taskUpdates } = command.updates;
      Object.assign(task, taskUpdates, { updatedAt: now });
      if (dueAt === null) delete task.dueAt;
      else if (dueAt !== undefined) task.dueAt = dueAt;
      if (task.archivedAt !== undefined) {
        next.calendar.recurrenceSeries.forEach((series) => {
          if (series.taskId === task.id) series.isActive = false;
        });
      }
      break;
    }
    case "remove-task":
      next.tasks = next.tasks.filter((task) => task.id !== command.taskId);
      next.subtasks = next.subtasks.filter(
        (subtask) => subtask.taskId !== command.taskId,
      );
      next.calendar.recurrenceSeries.forEach((series) => {
        if (series.taskId === command.taskId) series.isActive = false;
      });
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
      next.subtasks = next.subtasks.filter((subtask) =>
        next.tasks.some((task) => task.id === subtask.taskId),
      );
      next.calendar.recurrenceSeries.forEach((series) => {
        const task = next.tasks.find((item) => item.id === series.taskId);
        if (!task || task.archivedAt !== undefined) series.isActive = false;
      });
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
    case "add-subtask": {
      const taskExists = next.tasks.some((task) => task.id === command.taskId);
      if (!taskExists) throw new Error("This task is no longer available.");
      const title = command.title.trim();
      if (!title) throw new Error("Enter a subtask title.");
      if (
        command.parentSubtaskId !== null &&
        !next.subtasks.some(
          (subtask) =>
            subtask.id === command.parentSubtaskId &&
            subtask.taskId === command.taskId,
        )
      ) {
        throw new Error("This parent subtask is no longer available.");
      }
      const siblings = getSubtasksForParent(
        next.subtasks,
        command.taskId,
        command.parentSubtaskId,
      );
      const id = crypto.randomUUID();
      if (next.subtasks.some((subtask) => subtask.id === id)) {
        throw new Error("Unable to create a unique subtask.");
      }
      next.subtasks.push({
        id,
        taskId: command.taskId,
        parentSubtaskId: command.parentSubtaskId,
        title,
        isCompleted: false,
        position: siblings.length,
        createdAt: now,
        updatedAt: now,
      });
      break;
    }
    case "update-subtask": {
      const subtask = next.subtasks.find(
        (item) => item.id === command.subtaskId,
      );
      if (!subtask) throw new Error("This subtask is no longer available.");
      const title = command.title.trim();
      if (!title) throw new Error("A subtask title cannot be empty.");
      subtask.title = title;
      subtask.updatedAt = now;
      break;
    }
    case "toggle-subtask-completion": {
      const subtask = next.subtasks.find(
        (item) => item.id === command.subtaskId,
      );
      if (!subtask) throw new Error("This subtask is no longer available.");
      subtask.isCompleted = command.completed;
      subtask.updatedAt = now;
      break;
    }
    case "remove-subtask":
      next.subtasks = removeSubtaskTree(next.subtasks, command.subtaskId);
      break;
    case "reorder-subtasks":
      next.subtasks = reorderSubtasks(
        next.subtasks,
        command.subtaskId,
        command.targetSubtaskId,
        command.before,
      );
      break;
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
    case "create-recurrence": {
      const task = next.tasks.find((item) => item.id === command.taskId);
      if (!task) throw new Error("Choose an available task.");
      createRecurrence(next, task, command.startDate, command.rule);
      break;
    }
    case "create-task-and-recurrence": {
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
      createRecurrence(next, task, command.startDate, command.rule);
      break;
    }
    case "materialize-range":
      materializeRecurrenceRange(next, command.startDate, command.endDate);
      break;
    case "edit-occurrence": {
      const occurrence = next.calendar.scheduledOccurrences.find(
        (item) => item.id === command.occurrenceId,
      );
      if (!occurrence) {
        throw new Error("This scheduled task is no longer available.");
      }
      if (command.startTime !== undefined && !isValidTime(command.startTime)) {
        throw new Error("Choose a valid start time.");
      }
      if (
        command.startTime === undefined &&
        command.durationMinutes !== undefined
      ) {
        throw new Error("An untimed task cannot have a duration.");
      }
      const duration = command.startTime
        ? (command.durationMinutes ??
          next.tasks.find((task) => task.id === occurrence.taskId)
            ?.defaultDurationMinutes ??
          30)
        : undefined;
      if (
        duration !== undefined &&
        (!Number.isInteger(duration) || duration < 1 || duration > 1440)
      ) {
        throw new Error("Duration must be between 1 and 1440 minutes.");
      }
      if (command.startTime) {
        occurrence.startTime = command.startTime;
        occurrence.durationMinutes = duration;
      } else {
        delete occurrence.startTime;
        delete occurrence.durationMinutes;
      }
      break;
    }
    case "edit-recurrence":
      editRecurrence(
        next,
        command.seriesId,
        command.date,
        command.scope,
        command.rule,
      );
      break;
    case "delete-scheduled-occurrence":
      deleteScheduledOccurrence(next, command.occurrenceId, command.scope);
      break;
    case "set-occurrence-completion": {
      const occurrence = next.calendar.scheduledOccurrences.find(
        (item) => item.id === command.occurrenceId,
      );
      if (!occurrence || occurrence.isSkipped) {
        throw new Error("This scheduled task is no longer available.");
      }
      occurrence.isCompleted = command.completed;
      if (command.completed) occurrence.completedAt = now;
      else delete occurrence.completedAt;
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
    case "clear-sleep-migration":
      next.calendar.pendingSleepEventMigration = [];
      break;
  }

  assertValidSubtasks(next.tasks, next.subtasks);
  return next;
};

const persistSnapshot = (snapshot: CalendarSnapshot) => {
  const previousTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  const previousSubtasks = localStorage.getItem(SUBTASKS_STORAGE_KEY);
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
      SUBTASKS_STORAGE_KEY,
      JSON.stringify({
        state: { subtasks: snapshot.subtasks },
        version: SUBTASKS_STORAGE_VERSION,
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
    for (const [key, value] of [
      [TASKS_STORAGE_KEY, previousTasks],
      [SUBTASKS_STORAGE_KEY, previousSubtasks],
      [CALENDAR_STORAGE_KEY, previousCalendar],
    ] as const) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        // Keep the original write error as the useful failure reason.
      }
    }
    throw error;
  }
};

const applySnapshotToStores = (snapshot: CalendarSnapshot) => {
  taskStateHandler?.apply(snapshot.tasks);
  calendarStateHandler?.apply(snapshot.calendar);
  const supportsSubtasks = snapshot.supportsSubtasks === true;
  subtaskStateHandler?.setCoordinatorSupportsSubtasks(supportsSubtasks);
  if (supportsSubtasks) {
    subtaskStateHandler?.apply(snapshot.subtasks ?? []);
  }
};

const initializeSubtaskStorage = () => {
  if (localStorage.getItem(SUBTASKS_STORAGE_KEY) !== null) return;
  localStorage.setItem(
    SUBTASKS_STORAGE_KEY,
    JSON.stringify({
      state: { subtasks: subtaskStateHandler?.get() ?? [] },
      version: SUBTASKS_STORAGE_VERSION,
    }),
  );
};

const getPersistError = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to save calendar changes.";

const isSubtaskCommand = (command: CalendarCoordinatorCommand) =>
  command.type.includes("subtask");

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
    if (
      isSubtaskCommand(command) &&
      coordinator.coordinatorSupportsSubtasks === false
    ) {
      resolve({ success: false, error: LEGACY_SUBTASK_OWNER_ERROR });
      return;
    }
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
    if (
      isSubtaskCommand(command) &&
      coordinator?.coordinatorSupportsSubtasks === false
    ) {
      resolve({ success: false, error: LEGACY_SUBTASK_OWNER_ERROR });
      return;
    }
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
      const changeType = isSubtaskCommand(command)
        ? "Subtask changes"
        : "Calendar changes";
      toast.error(`${changeType} were not saved: ${result.error}`);
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
  const coordinator: ActiveCoordinator = {
    channel: supported ? new BroadcastChannel(CHANNEL_NAME) : null,
    disposed: false,
    isOwner: false,
    ready: false,
    hasRemoteState: false,
    coordinatorSupportsSubtasks: null,
    supported,
    releaseLock: null as (() => void) | null,
    commandQueue: Promise.resolve(),
    queuedCommands: [] as QueuedCommand[],
    pendingCommands: new Map<string, QueuedCommand>(),
  };
  activeCoordinator = coordinator;
  subtaskStateHandler?.setCoordinatorSupportsSubtasks(null);

  if (!supported) {
    coordinator.isOwner = true;
    coordinator.ready = true;
    coordinator.coordinatorSupportsSubtasks = true;
    subtaskStateHandler?.setCoordinatorSupportsSubtasks(true);
    try {
      initializeSubtaskStorage();
    } catch (error) {
      toast.error(
        `Subtask storage was not initialized: ${getPersistError(error)}`,
      );
    }
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
        coordinator.coordinatorSupportsSubtasks =
          message.snapshot.supportsSubtasks === true;
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
      coordinator.coordinatorSupportsSubtasks = true;
      await Promise.all([
        taskStateHandler?.rehydrate(),
        subtaskStateHandler?.rehydrate(),
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
      coordinator.coordinatorSupportsSubtasks = true;
      subtaskStateHandler?.setCoordinatorSupportsSubtasks(true);
      try {
        initializeSubtaskStorage();
      } catch (error) {
        toast.error(
          `Subtask storage was not initialized: ${getPersistError(error)}`,
        );
      }
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
